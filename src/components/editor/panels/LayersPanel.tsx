"use client";

import { FabricImage, Textbox } from "fabric";
import { useEditorStore } from "@/store/editorStore";
import { useCommit } from "@/hooks/useCommit";
import {
  duplicateObject,
  moveLayer,
  setObjectLocked,
  type EditorObject,
} from "@/lib/fabricHelpers";
import BottomSheet from "@/components/ui/BottomSheet";

/** Layer panel: reorder, lock, hide, duplicate, delete. Top row = front layer. */
export default function LayersPanel() {
  const canvas = useEditorStore((s) => s.canvas);
  const closePanel = useEditorStore((s) => s.closePanel);
  const selected = useEditorStore((s) => s.selectedObject);
  useEditorStore((s) => s.selectionVersion);
  const bumpSelection = useEditorStore((s) => s.bumpSelection);
  const commit = useCommit();

  if (!canvas) return null;

  const objects = canvas.getObjects().slice().reverse() as EditorObject[];

  const labelFor = (o: EditorObject) => {
    if (o instanceof Textbox) return (o.text ?? "").split("\n")[0].slice(0, 22) || "টেক্সট";
    if (o instanceof FabricImage) {
      const meta = o as EditorObject;
      return meta.layerName ?? (meta.isLogo ? "লোগো" : "ছবি");
    }
    return o.layerName ?? "এলিমেন্ট";
  };

  const select = (o: EditorObject) => {
    if (o.locked) return;
    canvas.setActiveObject(o);
    canvas.requestRenderAll();
    bumpSelection();
  };

  return (
    <BottomSheet title="লেয়ার" onClose={closePanel}>
      {objects.length === 0 ? (
        <p className="py-6 text-center text-xs text-zinc-400">ক্যানভাসে কোনো এলিমেন্ট নেই।</p>
      ) : (
        <ul className="space-y-1">
          {objects.map((o, i) => (
            <li
              key={o.id ?? i}
              className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 ${
                selected === o ? "border-indigo-400 bg-indigo-50" : "border-zinc-200 bg-white"
              }`}
            >
              <button onClick={() => select(o)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                <span className="shrink-0 text-zinc-400">
                  {o instanceof Textbox ? (
                    <span className="text-sm font-bold">T</span>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
                    </svg>
                  )}
                </span>
                <span className={`truncate text-xs font-medium ${o.visible ? "text-zinc-800" : "text-zinc-300 line-through"}`}>
                  {labelFor(o)}
                </span>
              </button>

              <IconBtn label="উপরে" onClick={() => { moveLayer(canvas, o, "up"); commit(); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6" /></svg>
              </IconBtn>
              <IconBtn label="নিচে" onClick={() => { moveLayer(canvas, o, "down"); commit(); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
              </IconBtn>
              <IconBtn
                label={o.visible ? "লুকান" : "দেখান"}
                active={!o.visible}
                onClick={() => {
                  o.set("visible", !o.visible);
                  canvas.requestRenderAll();
                  commit();
                }}
              >
                {o.visible ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m2 2 20 20M6.7 6.7C3.7 8.6 2 12 2 12s3.5 7 10 7c1.9 0 3.6-.5 5-1.2M10.6 5.1C11 5 11.5 5 12 5c6.5 0 10 7 10 7s-.8 1.6-2.4 3.2" />
                  </svg>
                )}
              </IconBtn>
              <IconBtn
                label={o.locked ? "আনলক" : "লক"}
                active={!!o.locked}
                onClick={() => {
                  setObjectLocked(canvas, o, !o.locked);
                  commit();
                }}
              >
                {o.locked ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" />
                  </svg>
                )}
              </IconBtn>
              <IconBtn label="ডুপ্লিকেট" onClick={() => void duplicateObject(canvas, o).then(commit)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="12" height="12" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </IconBtn>
              <IconBtn
                label="মুছুন"
                danger
                onClick={() => {
                  canvas.remove(o);
                  canvas.discardActiveObject();
                  canvas.requestRenderAll();
                  commit();
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                </svg>
              </IconBtn>
            </li>
          ))}
        </ul>
      )}
    </BottomSheet>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  danger,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded active:bg-zinc-100 ${
        danger ? "text-red-400" : active ? "text-indigo-600" : "text-zinc-400"
      }`}
    >
      {children}
    </button>
  );
}
