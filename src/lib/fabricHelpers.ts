import {
  ActiveSelection,
  Canvas,
  FabricImage,
  FabricObject,
  Gradient,
  Shadow,
  Textbox,
  filters,
  util,
} from "fabric";
import type { WordColorMap } from "@/types";

/**
 * Fabric indexes text styles and selections by *grapheme*, not by JS string
 * character. Bengali combining signs (দি, পা, ত্রী…) cluster into single
 * graphemes, so all range math MUST use Fabric's own splitter.
 */
const splitGraphemes = (s: string): string[] => util.string.graphemeSplit(s);

const isSpace = (g: string): boolean => /^\s+$/.test(g);

/** Extra (custom) properties persisted in the canvas JSON. */
export const EXTRA_PROPS = [
  "id",
  "layerName",
  "locked",
  "isLogo",
  "isWatermark",
  "selectable",
  "evented",
  "lockMovementX",
  "lockMovementY",
  "lockScalingX",
  "lockScalingY",
  "lockRotation",
  "editable",
  // Photo glass overlay: original photo kept so the glass can be removed
  "originalSrc",
  "hasGlass",
  // Shapes
  "isShape",
  "shapeType",
  "rx",
  "ry",
];

/** Fabric object extended with our editor metadata. */
export type EditorObject = FabricObject & {
  id?: string;
  layerName?: string;
  locked?: boolean;
  isLogo?: boolean;
  isWatermark?: boolean;
  isShape?: boolean;
  shapeType?: string;
};

export function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

/** Touch-friendly selection controls, applied once at editor startup. */
export function configureFabricDefaults(): void {
  Object.assign(FabricObject.ownDefaults, {
    cornerStyle: "circle",
    cornerColor: "#ffffff",
    cornerStrokeColor: "#4f46e5",
    cornerSize: 11,
    touchCornerSize: 26,
    transparentCorners: false,
    borderColor: "#4f46e5",
    borderScaleFactor: 1.5,
    padding: 6,
  });
}

// ── Text ────────────────────────────────────────────────────────

export interface AddTextOptions {
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fill?: string;
}

export function addText(canvas: Canvas, opts: AddTextOptions = {}): Textbox {
  const w = canvas.getWidth();
  const tb = new Textbox(opts.text ?? "আপনার লেখা এখানে", {
    width: w * 0.8,
    left: w / 2,
    top: canvas.getHeight() / 2,
    originX: "center",
    originY: "center",
    fontFamily: opts.fontFamily ?? "Hind Siliguri",
    fontSize: opts.fontSize ?? Math.round(w * 0.06),
    fill: opts.fill ?? "#ffffff",
    textAlign: "center",
    lineHeight: 1.25,
    // Stroke stays behind the fill so Bengali glyphs remain crisp
    paintFirst: "stroke",
    strokeWidth: 0,
    stroke: "#000000",
  }) as Textbox & EditorObject;
  (tb as EditorObject).id = uid();
  (tb as EditorObject).layerName = "টেক্সট";
  canvas.add(tb);
  canvas.setActiveObject(tb);
  canvas.requestRenderAll();
  return tb;
}

/**
 * Builds a Fabric per-character `styles` object that colors whole words.
 * This is how word-level styling inside one line works
 * (e.g. দিনদার = blue, পাত্রী = pink).
 */
export function buildWordStyles(
  text: string,
  wordColors: WordColorMap
): Record<number, Record<number, { fill: string }>> {
  const styles: Record<number, Record<number, { fill: string }>> = {};
  text.split("\n").forEach((line, lineIdx) => {
    const graphemes = splitGraphemes(line);
    let i = 0;
    while (i < graphemes.length) {
      if (isSpace(graphemes[i])) {
        i++;
        continue;
      }
      let j = i;
      while (j < graphemes.length && !isSpace(graphemes[j])) j++;
      const color = wordColors[graphemes.slice(i, j).join("")];
      if (color) {
        styles[lineIdx] = styles[lineIdx] || {};
        for (let k = i; k < j; k++) styles[lineIdx][k] = { fill: color };
      }
      i = j;
    }
  });
  return styles;
}

/** Grapheme ranges (offsets in the flat text) for every line and word. */
export function getTextRanges(text: string): {
  lines: { label: string; start: number; end: number }[];
  words: { label: string; start: number; end: number }[];
} {
  const lines: { label: string; start: number; end: number }[] = [];
  const words: { label: string; start: number; end: number }[] = [];
  let offset = 0;
  text.split("\n").forEach((line) => {
    const graphemes = splitGraphemes(line);
    lines.push({ label: line || "(খালি লাইন)", start: offset, end: offset + graphemes.length });
    let i = 0;
    while (i < graphemes.length) {
      if (isSpace(graphemes[i])) {
        i++;
        continue;
      }
      let j = i;
      while (j < graphemes.length && !isSpace(graphemes[j])) j++;
      words.push({
        label: graphemes.slice(i, j).join(""),
        start: offset + i,
        end: offset + j,
      });
      i = j;
    }
    offset += graphemes.length + 1; // newline = one grapheme in Fabric's text model
  });
  return { lines, words };
}

// ── Background ──────────────────────────────────────────────────

export function setSolidBackground(canvas: Canvas, color: string): void {
  canvas.backgroundColor = color;
  canvas.requestRenderAll();
}

export function setGradientBackground(
  canvas: Canvas,
  colors: [string, string],
  angleDeg = 90
): void {
  const w = canvas.getWidth();
  const h = canvas.getHeight();
  const rad = (angleDeg * Math.PI) / 180;
  // Project the angle onto the canvas rectangle for the gradient line
  const cx = w / 2;
  const cy = h / 2;
  const len = Math.abs(w * Math.cos(rad)) + Math.abs(h * Math.sin(rad));
  const dx = (Math.cos(rad) * len) / 2;
  const dy = (Math.sin(rad) * len) / 2;
  canvas.backgroundColor = new Gradient({
    type: "linear",
    gradientUnits: "pixels",
    coords: { x1: cx - dx, y1: cy - dy, x2: cx + dx, y2: cy + dy },
    colorStops: [
      { offset: 0, color: colors[0] },
      { offset: 1, color: colors[1] },
    ],
  });
  canvas.requestRenderAll();
}

export async function setImageBackground(canvas: Canvas, dataUrl: string): Promise<void> {
  const img = await FabricImage.fromURL(dataUrl, { crossOrigin: "anonymous" });
  const w = canvas.getWidth();
  const h = canvas.getHeight();
  // Cover-fit the image
  const scale = Math.max(w / (img.width ?? 1), h / (img.height ?? 1));
  img.set({
    scaleX: scale,
    scaleY: scale,
    originX: "left",
    originY: "top",
    left: (w - (img.width ?? 0) * scale) / 2,
    top: (h - (img.height ?? 0) * scale) / 2,
    selectable: false,
    evented: false,
  });
  canvas.backgroundImage = img;
  canvas.requestRenderAll();
}

/** Adjust blur (0–1) and opacity (0–1) of the background image. */
export function updateBackgroundImage(
  canvas: Canvas,
  { blur, opacity }: { blur?: number; opacity?: number }
): void {
  const img = canvas.backgroundImage as FabricImage | undefined;
  if (!img) return;
  if (opacity !== undefined) img.set({ opacity });
  if (blur !== undefined) {
    img.filters = blur > 0 ? [new filters.Blur({ blur })] : [];
    img.applyFilters();
  }
  canvas.requestRenderAll();
}

export function removeImageBackground(canvas: Canvas): void {
  canvas.backgroundImage = undefined;
  canvas.requestRenderAll();
}

// ── Images / logos ──────────────────────────────────────────────

export async function addImage(
  canvas: Canvas,
  dataUrl: string,
  opts: { isLogo?: boolean; name?: string } = {}
): Promise<FabricImage> {
  const img = (await FabricImage.fromURL(dataUrl, {
    crossOrigin: "anonymous",
  })) as FabricImage & EditorObject;
  const w = canvas.getWidth();
  const targetW = opts.isLogo ? w * 0.22 : w * 0.6;
  const scale = targetW / (img.width ?? 1);
  img.set({
    scaleX: scale,
    scaleY: scale,
    originX: "center",
    originY: "center",
    left: opts.isLogo ? w - targetW / 2 - w * 0.04 : w / 2,
    top: opts.isLogo
      ? canvas.getHeight() - ((img.height ?? 0) * scale) / 2 - w * 0.04
      : canvas.getHeight() / 2,
  });
  img.id = uid();
  img.layerName = opts.name ?? (opts.isLogo ? "লোগো" : "ছবি");
  img.isLogo = !!opts.isLogo;
  canvas.add(img);
  canvas.setActiveObject(img);
  canvas.requestRenderAll();
  return img;
}

/** Small semi-transparent watermark text at the bottom center. */
export function addWatermark(canvas: Canvas, text: string, fontFamily: string): Textbox {
  const w = canvas.getWidth();
  const tb = new Textbox(text, {
    width: w * 0.9,
    left: w / 2,
    top: canvas.getHeight() - w * 0.035,
    originX: "center",
    originY: "center",
    fontFamily,
    fontSize: Math.round(w * 0.025),
    fill: "#ffffff",
    opacity: 0.55,
    textAlign: "center",
    shadow: new Shadow({ color: "rgba(0,0,0,0.5)", blur: 4, offsetX: 0, offsetY: 1 }),
  }) as Textbox & EditorObject;
  (tb as EditorObject).id = uid();
  (tb as EditorObject).layerName = "ওয়াটারমার্ক";
  (tb as EditorObject).isWatermark = true;
  canvas.add(tb);
  return tb;
}

// ── Layer operations ────────────────────────────────────────────

export async function duplicateObject(canvas: Canvas, obj: FabricObject): Promise<void> {
  const clone = (await obj.clone(EXTRA_PROPS)) as EditorObject;
  clone.id = uid();
  clone.set({ left: (obj.left ?? 0) + 24, top: (obj.top ?? 0) + 24 });
  canvas.add(clone);
  canvas.setActiveObject(clone);
  canvas.requestRenderAll();
}

export function setObjectLocked(canvas: Canvas, obj: EditorObject, locked: boolean): void {
  obj.locked = locked;
  obj.set({
    lockMovementX: locked,
    lockMovementY: locked,
    lockScalingX: locked,
    lockScalingY: locked,
    lockRotation: locked,
    selectable: !locked,
    evented: !locked,
  });
  if (locked && canvas.getActiveObject() === obj) canvas.discardActiveObject();
  canvas.requestRenderAll();
}

export function moveLayer(
  canvas: Canvas,
  obj: FabricObject,
  dir: "up" | "down" | "top" | "bottom"
): void {
  if (dir === "up") canvas.bringObjectForward(obj);
  else if (dir === "down") canvas.sendObjectBackwards(obj);
  else if (dir === "top") canvas.bringObjectToFront(obj);
  else canvas.sendObjectToBack(obj);
  canvas.requestRenderAll();
}

// ── Copy / Cut / Paste ──────────────────────────────────────────
//
// Object-level clipboard for whole layers (text, shapes, images). Stored in
// localStorage so it also survives switching between designs. Character-level
// copy/paste inside text editing is left to the browser's native clipboard.

const CLIPBOARD_KEY = "bte-clipboard";

/** Copies the selected object(s) to the clipboard. Returns false if nothing selected. */
export function copyActiveObjects(canvas: Canvas): boolean {
  const actives = canvas.getActiveObjects();
  if (actives.length === 0) return false;
  const jsons = actives.map((o) => o.toObject(EXTRA_PROPS));
  try {
    localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(jsons));
  } catch {
    return false;
  }
  return true;
}

/** Copies then removes the selected object(s). */
export function cutActiveObjects(canvas: Canvas): boolean {
  if (!copyActiveObjects(canvas)) return false;
  canvas.remove(...canvas.getActiveObjects());
  canvas.discardActiveObject();
  canvas.requestRenderAll();
  return true;
}

export function clipboardHasContent(): boolean {
  try {
    return !!localStorage.getItem(CLIPBOARD_KEY);
  } catch {
    return false;
  }
}

/** Pastes clipboard object(s) with a small offset and selects them. */
export async function pasteFromClipboard(canvas: Canvas): Promise<boolean> {
  let jsons: Record<string, unknown>[];
  try {
    const raw = localStorage.getItem(CLIPBOARD_KEY);
    if (!raw) return false;
    jsons = JSON.parse(raw);
  } catch {
    return false;
  }
  if (!Array.isArray(jsons) || jsons.length === 0) return false;

  const objects = (await util.enlivenObjects(jsons)) as EditorObject[];
  if (objects.length === 0) return false;

  objects.forEach((obj) => {
    obj.id = uid();
    obj.set({ left: (obj.left ?? 0) + 30, top: (obj.top ?? 0) + 30 });
    canvas.add(obj);
  });

  if (objects.length === 1) {
    canvas.setActiveObject(objects[0]);
  } else {
    const sel = new ActiveSelection(objects, { canvas });
    canvas.setActiveObject(sel);
  }
  canvas.requestRenderAll();
  return true;
}

// ── Serialization ───────────────────────────────────────────────

export function serializeCanvas(canvas: Canvas): string {
  return JSON.stringify(canvas.toObject(EXTRA_PROPS));
}

/** Small JPEG preview for dashboard cards. */
export function generateThumbnail(canvas: Canvas, maxPx = 320): string {
  const multiplier = maxPx / Math.max(canvas.getWidth(), canvas.getHeight());
  return canvas.toDataURL({ format: "jpeg", quality: 0.75, multiplier });
}
