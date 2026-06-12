import { create } from "zustand";
import type { Canvas, FabricObject } from "fabric";
import type { BrandSettings } from "@/types";
import { serializeCanvas } from "@/lib/fabricHelpers";

export type PanelId = "text" | "background" | "logo" | "layers" | "templates" | "export";
export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

const HISTORY_LIMIT = 50;

interface EditorState {
  canvas: Canvas | null;
  designId: string | null;
  designName: string;
  width: number;
  height: number;

  zoom: number;
  fitZoom: number;

  activePanel: PanelId | null;
  selectedObject: FabricObject | null;
  /** Bumped whenever object properties change so panels re-read values. */
  selectionVersion: number;

  saveStatus: SaveStatus;
  dirty: boolean;

  history: string[];
  historyIndex: number;
  /** True while undo/redo is restoring — suppresses history pushes. */
  isRestoring: boolean;

  customFonts: string[];
  brand: BrandSettings | null;

  // actions
  setCanvas: (c: Canvas | null) => void;
  setDesign: (meta: { id: string; name: string; width: number; height: number }) => void;
  setDesignName: (name: string) => void;
  setZoom: (z: number) => void;
  setFitZoom: (z: number) => void;
  openPanel: (p: PanelId) => void;
  closePanel: () => void;
  setSelectedObject: (o: FabricObject | null) => void;
  bumpSelection: () => void;
  setSaveStatus: (s: SaveStatus) => void;
  markDirty: () => void;
  markSaved: () => void;
  setBrand: (b: BrandSettings) => void;
  addCustomFont: (family: string) => void;
  setCustomFonts: (families: string[]) => void;

  pushHistory: () => void;
  resetHistory: () => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  canvas: null,
  designId: null,
  designName: "Untitled Design",
  width: 1080,
  height: 1080,
  zoom: 1,
  fitZoom: 1,
  activePanel: null,
  selectedObject: null,
  selectionVersion: 0,
  saveStatus: "saved",
  dirty: false,
  history: [],
  historyIndex: -1,
  isRestoring: false,
  customFonts: [],
  brand: null,

  setCanvas: (canvas) => set({ canvas }),
  setDesign: ({ id, name, width, height }) =>
    set({ designId: id, designName: name, width, height }),
  setDesignName: (designName) => set({ designName, dirty: true, saveStatus: "unsaved" }),
  setZoom: (zoom) => set({ zoom: Math.min(4, Math.max(0.1, zoom)) }),
  setFitZoom: (fitZoom) => set({ fitZoom }),
  openPanel: (p) => set((s) => ({ activePanel: s.activePanel === p ? null : p })),
  closePanel: () => set({ activePanel: null }),
  setSelectedObject: (selectedObject) =>
    set((s) => ({ selectedObject, selectionVersion: s.selectionVersion + 1 })),
  bumpSelection: () => set((s) => ({ selectionVersion: s.selectionVersion + 1 })),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  markDirty: () => set({ dirty: true, saveStatus: "unsaved" }),
  markSaved: () => set({ dirty: false, saveStatus: "saved" }),
  setBrand: (brand) => set({ brand }),
  addCustomFont: (family) =>
    set((s) => ({ customFonts: s.customFonts.includes(family) ? s.customFonts : [...s.customFonts, family] })),
  setCustomFonts: (customFonts) => set({ customFonts }),

  pushHistory: () => {
    const { canvas, isRestoring, history, historyIndex } = get();
    if (!canvas || isRestoring) return;
    const json = serializeCanvas(canvas);
    // Skip no-op snapshots (e.g. selection-only events)
    if (history[historyIndex] === json) return;
    const next = history.slice(0, historyIndex + 1);
    next.push(json);
    if (next.length > HISTORY_LIMIT) next.shift();
    set({ history: next, historyIndex: next.length - 1 });
  },

  resetHistory: () => {
    const { canvas } = get();
    if (!canvas) return;
    set({ history: [serializeCanvas(canvas)], historyIndex: 0 });
  },

  undo: async () => {
    const { canvas, history, historyIndex } = get();
    if (!canvas || historyIndex <= 0) return;
    const idx = historyIndex - 1;
    set({ isRestoring: true, historyIndex: idx });
    await canvas.loadFromJSON(JSON.parse(history[idx]));
    canvas.renderAll();
    set({ isRestoring: false, selectedObject: null, dirty: true, saveStatus: "unsaved" });
    get().bumpSelection();
  },

  redo: async () => {
    const { canvas, history, historyIndex } = get();
    if (!canvas || historyIndex >= history.length - 1) return;
    const idx = historyIndex + 1;
    set({ isRestoring: true, historyIndex: idx });
    await canvas.loadFromJSON(JSON.parse(history[idx]));
    canvas.renderAll();
    set({ isRestoring: false, selectedObject: null, dirty: true, saveStatus: "unsaved" });
    get().bumpSelection();
  },
}));
