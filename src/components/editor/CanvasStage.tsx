"use client";

import { useEffect, useRef } from "react";
import { Canvas } from "fabric";
import { useEditorStore } from "@/store/editorStore";
import { copyActiveObjects, cutActiveObjects, pasteFromClipboard } from "@/lib/fabricHelpers";

/**
 * Mounts the Fabric canvas at full design resolution and scales it with
 * CSS (`cssOnly`) for zooming — the internal bitmap always stays at design
 * size, so exports and coordinates are exact.
 */
export default function CanvasStage({ onReady }: { onReady: (c: Canvas) => void }) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const width = useEditorStore((s) => s.width);
  const height = useEditorStore((s) => s.height);
  const zoom = useEditorStore((s) => s.zoom);

  // ── Init ──
  useEffect(() => {
    const el = canvasElRef.current;
    if (!el) return;
    const { width: w, height: h } = useEditorStore.getState();

    const canvas = new Canvas(el, {
      width: w,
      height: h,
      preserveObjectStacking: true,
      selection: true,
      backgroundColor: "#1e293b",
      // Keep memory low on phones: no retina upscaling of the edit surface
      enableRetinaScaling: false,
    });
    fabricRef.current = canvas;

    const store = useEditorStore.getState;

    // Selection tracking
    const syncSelection = () => store().setSelectedObject(canvas.getActiveObject() ?? null);
    canvas.on("selection:created", syncSelection);
    canvas.on("selection:updated", syncSelection);
    canvas.on("selection:cleared", () => store().setSelectedObject(null));

    // History + dirty tracking (suppressed during undo/redo restore)
    const snapshot = () => {
      if (store().isRestoring) return;
      store().markDirty();
      store().pushHistory();
      store().bumpSelection();
    };
    canvas.on("object:modified", snapshot);
    canvas.on("object:added", snapshot);
    canvas.on("object:removed", snapshot);

    // Text edits: dirty immediately, snapshot when editing ends
    canvas.on("text:changed", () => {
      if (!store().isRestoring) store().markDirty();
    });
    canvas.on("text:editing:exited", snapshot);

    // Fit-to-screen zoom
    const fit = () => {
      const box = containerRef.current;
      if (!box) return;
      const s = Math.min((box.clientWidth - 24) / w, (box.clientHeight - 24) / h, 1.5);
      store().setFitZoom(s);
      store().setZoom(s);
    };
    fit();
    window.addEventListener("resize", fit);

    // Desktop conveniences: delete + undo/redo + copy/cut/paste.
    // While editing text we never preventDefault, so the browser's native
    // character-level copy/cut/paste keeps working inside the textbox.
    const onKeyDown = (e: KeyboardEvent) => {
      const active = canvas.getActiveObject();
      const editingText =
        active && "isEditing" in active && (active as { isEditing?: boolean }).isEditing;
      const mod = e.ctrlKey || e.metaKey;
      if ((e.key === "Delete" || e.key === "Backspace") && active && !editingText) {
        canvas.remove(...canvas.getActiveObjects());
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      } else if (mod && e.key === "z" && !editingText) {
        e.preventDefault();
        void store().undo();
      } else if (mod && e.key === "y" && !editingText) {
        e.preventDefault();
        void store().redo();
      } else if (mod && e.key === "c" && !editingText) {
        if (copyActiveObjects(canvas)) {
          e.preventDefault();
          store().setHasClipboard(true);
        }
      } else if (mod && e.key === "x" && !editingText) {
        if (cutActiveObjects(canvas)) {
          e.preventDefault();
          store().setHasClipboard(true);
        }
      } else if (mod && e.key === "v" && !editingText) {
        e.preventDefault();
        void pasteFromClipboard(canvas);
      }
    };
    window.addEventListener("keydown", onKeyDown);

    onReadyRef.current(canvas);

    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("keydown", onKeyDown);
      void canvas.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Apply zoom via CSS scaling (bitmap stays at design resolution) ──
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setDimensions(
      { width: `${width * zoom}px`, height: `${height * zoom}px` },
      { cssOnly: true }
    );
    canvas.calcOffset();
  }, [zoom, width, height]);

  return (
    <div
      ref={containerRef}
      className="canvas-stage flex flex-1 items-center justify-center overflow-auto p-3"
    >
      <div className="shadow-xl" style={{ lineHeight: 0 }}>
        <canvas ref={canvasElRef} />
      </div>
    </div>
  );
}
