"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Canvas } from "fabric";
import { useEditorStore } from "@/store/editorStore";
import {
  addImage,
  addWatermark,
  configureFabricDefaults,
  generateThumbnail,
  serializeCanvas,
  setSolidBackground,
} from "@/lib/fabricHelpers";
import { applyTemplate, getTemplate } from "@/lib/templates";
import { ensureFontsLoaded, preloadBuiltinFonts } from "@/lib/fonts";
import { loadAllCustomFonts, saveDraftBackup } from "@/lib/idb";
import { clipboardHasContent } from "@/lib/fabricHelpers";
import type { BrandSettings, DesignRecord, LogoRecord } from "@/types";
import CanvasStage from "./CanvasStage";
import TopBar from "./TopBar";
import BottomToolbar from "./BottomToolbar";
import SelectionActions from "./SelectionActions";
import TextPanel from "./panels/TextPanel";
import ShapesPanel from "./panels/ShapesPanel";
import BackgroundPanel from "./panels/BackgroundPanel";
import LogoPanel from "./panels/LogoPanel";
import LayersPanel from "./panels/LayersPanel";
import TemplatesPanel from "./panels/TemplatesPanel";
import ExportPanel from "./panels/ExportPanel";

const AUTOSAVE_INTERVAL_MS = 4000;

/**
 * Editor orchestrator: loads (or creates) the design, initializes fonts &
 * brand defaults, wires auto-save, and renders the editor chrome.
 */
export default function EditorShell() {
  const params = useSearchParams();
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const initialDesign = useRef<DesignRecord | null>(null);
  const isNewDesign = useRef(false);
  const brandRef = useRef<BrandSettings | null>(null);

  const activePanel = useEditorStore((s) => s.activePanel);
  const setDesign = useEditorStore((s) => s.setDesign);
  const setBrand = useEditorStore((s) => s.setBrand);

  // ── Bootstrap: fonts + brand + design record ──────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        configureFabricDefaults();

        const [brand, customFonts] = await Promise.all([
          fetch("/api/brand").then((r) => r.json()).catch(() => null),
          loadAllCustomFonts(),
          preloadBuiltinFonts(),
        ]);
        if (cancelled) return;
        if (brand) {
          brandRef.current = brand as BrandSettings;
          setBrand(brand as BrandSettings);
        }
        useEditorStore.getState().setCustomFonts(customFonts);
        useEditorStore.getState().setHasClipboard(clipboardHasContent());

        const id = params.get("id");
        if (id) {
          const res = await fetch(`/api/designs/${id}`);
          if (!res.ok) throw new Error("design not found");
          const design = (await res.json()) as DesignRecord;
          initialDesign.current = design;
          setDesign({ id: design.id, name: design.name, width: design.width, height: design.height });
        } else {
          // New design (blank or from template)
          isNewDesign.current = true;
          const templateId = params.get("template");
          const w = Number(params.get("w")) || brandRef.current?.canvasWidth || 1080;
          const h = Number(params.get("h")) || brandRef.current?.canvasHeight || 1080;
          const tpl = templateId ? getTemplate(templateId) : undefined;
          const res = await fetch("/api/designs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: tpl ? tpl.name : "নতুন ডিজাইন",
              width: w,
              height: h,
              data: "{}",
            }),
          });
          if (!res.ok) throw new Error("could not create design");
          const design = (await res.json()) as DesignRecord;
          initialDesign.current = { ...design, data: "{}" };
          setDesign({ id: design.id, name: design.name, width: design.width, height: design.height });
        }
        if (!cancelled) setPhase("ready");
      } catch (e) {
        console.error(e);
        if (!cancelled) setPhase("error");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Canvas ready: restore content / apply template & brand ────
  const handleCanvasReady = useCallback(async (canvas: Canvas) => {
    const store = useEditorStore.getState();
    store.setCanvas(canvas);
    useEditorStore.setState({ isRestoring: true });

    const design = initialDesign.current;
    let parsed: { objects?: unknown[] } | null = null;
    try {
      parsed = design?.data ? JSON.parse(design.data) : null;
    } catch {
      parsed = null;
    }

    if (parsed && (parsed.objects?.length || ("background" in parsed && parsed.background))) {
      // Existing design — make sure its fonts are ready, then restore
      const families = new Set<string>();
      (parsed.objects as { fontFamily?: string }[] | undefined)?.forEach(
        (o) => o.fontFamily && families.add(o.fontFamily)
      );
      await ensureFontsLoaded([...families]);
      await canvas.loadFromJSON(parsed);
    } else {
      // Fresh canvas
      setSolidBackground(canvas, "#1e293b");
      const templateId = params.get("template");
      const tpl = templateId ? getTemplate(templateId) : undefined;
      if (tpl) {
        await ensureFontsLoaded(tpl.texts.map((t) => t.fontFamily));
        applyTemplate(canvas, tpl);
      }
      // Brand defaults: watermark + default logo on every new project
      const brand = brandRef.current;
      if (brand?.watermarkText) {
        addWatermark(canvas, brand.watermarkText, brand.defaultFont);
      }
      if (brand?.defaultLogoId) {
        try {
          const logos = (await fetch("/api/logos").then((r) => r.json())) as LogoRecord[];
          const logo = logos.find((l) => l.id === brand.defaultLogoId);
          if (logo) await addImage(canvas, logo.data, { isLogo: true, name: logo.name });
        } catch {
          /* logo is optional */
        }
      }
      canvas.discardActiveObject();
    }

    canvas.renderAll();
    useEditorStore.setState({ isRestoring: false });
    store.resetHistory();

    if (isNewDesign.current) void saveNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Save ──────────────────────────────────────────────────────
  const saveNow = useCallback(async () => {
    const s = useEditorStore.getState();
    if (!s.canvas || !s.designId || s.saveStatus === "saving") return;
    s.setSaveStatus("saving");
    const json = serializeCanvas(s.canvas);
    void saveDraftBackup(s.designId, json); // offline crash backup
    try {
      const res = await fetch(`/api/designs/${s.designId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: s.designName,
          data: json,
          thumbnail: generateThumbnail(s.canvas),
        }),
      });
      if (!res.ok) throw new Error("save failed");
      s.markSaved();
    } catch {
      s.setSaveStatus("error");
    }
  }, []);

  // Auto-save loop
  useEffect(() => {
    const t = setInterval(() => {
      if (useEditorStore.getState().dirty) void saveNow();
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(t);
  }, [saveNow]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (useEditorStore.getState().dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // Reset store when leaving the editor
  useEffect(
    () => () => {
      useEditorStore.setState({
        canvas: null,
        designId: null,
        selectedObject: null,
        activePanel: null,
        history: [],
        historyIndex: -1,
        dirty: false,
        saveStatus: "saved",
      });
    },
    []
  );

  if (phase === "loading") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-2 text-zinc-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        <span className="text-sm">ফন্ট ও ডিজাইন লোড হচ্ছে…</span>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-zinc-600">ডিজাইনটি লোড করা যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।</p>
        <a href="/" className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white">
          ← ড্যাশবোর্ডে ফিরুন
        </a>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-zinc-100">
      <TopBar onSave={saveNow} />
      <CanvasStage onReady={handleCanvasReady} />
      <SelectionActions />
      {activePanel === "text" && <TextPanel />}
      {activePanel === "shapes" && <ShapesPanel />}
      {activePanel === "background" && <BackgroundPanel />}
      {activePanel === "logo" && <LogoPanel />}
      {activePanel === "layers" && <LayersPanel />}
      {activePanel === "templates" && <TemplatesPanel />}
      {activePanel === "export" && <ExportPanel onSave={saveNow} />}
      <BottomToolbar />
    </div>
  );
}
