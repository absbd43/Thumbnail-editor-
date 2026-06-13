import {
  Canvas,
  Circle,
  Ellipse,
  FabricObject,
  Line,
  Path,
  Polygon,
  Rect,
  Triangle,
} from "fabric";
import { uid, type EditorObject } from "./fabricHelpers";

export type ShapeType =
  | "rect"
  | "roundRect"
  | "circle"
  | "ellipse"
  | "triangle"
  | "line"
  | "star"
  | "heart"
  | "arrow"
  | "hexagon";

export const SHAPE_DEFS: { type: ShapeType; label: string }[] = [
  { type: "rect", label: "আয়তক্ষেত্র" },
  { type: "roundRect", label: "গোল কোণা" },
  { type: "circle", label: "বৃত্ত" },
  { type: "ellipse", label: "উপবৃত্ত" },
  { type: "triangle", label: "ত্রিভুজ" },
  { type: "line", label: "লাইন" },
  { type: "star", label: "তারা" },
  { type: "heart", label: "হার্ট" },
  { type: "arrow", label: "তীর" },
  { type: "hexagon", label: "ষড়ভুজ" },
];

const DEFAULT_FILL = "#6366f1";
const DEFAULT_LINE = "#111827";

/** True for objects created via the shapes panel. */
export function isShape(o: FabricObject | null | undefined): boolean {
  return !!o && (o as EditorObject).isShape === true;
}

/** True for the line shape (edited via stroke, not fill). */
export function isLineShape(o: FabricObject | null | undefined): boolean {
  return isShape(o) && (o as EditorObject).shapeType === "line";
}

function regularPolygonPoints(sides: number, r: number, rotation = -Math.PI / 2) {
  const pts: { x: number; y: number }[] = [];
  const step = (Math.PI * 2) / sides;
  for (let i = 0; i < sides; i++) {
    const a = rotation + i * step;
    pts.push({ x: r + r * Math.cos(a), y: r + r * Math.sin(a) });
  }
  return pts;
}

function starPoints(outer: number, inner: number, points = 5) {
  const pts: { x: number; y: number }[] = [];
  const step = Math.PI / points;
  let angle = -Math.PI / 2;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    pts.push({ x: outer + r * Math.cos(angle), y: outer + r * Math.sin(angle) });
    angle += step;
  }
  return pts;
}

/** Creates a shape sized relative to the canvas and centered on it. */
export function makeShape(canvas: Canvas, type: ShapeType): FabricObject {
  const w = canvas.getWidth();
  const s = w * 0.32;
  const common = {
    originX: "center" as const,
    originY: "center" as const,
    left: w / 2,
    top: canvas.getHeight() / 2,
  };

  let obj: FabricObject;

  switch (type) {
    case "rect":
      obj = new Rect({ ...common, width: s, height: s * 0.66, fill: DEFAULT_FILL });
      break;
    case "roundRect":
      obj = new Rect({
        ...common,
        width: s,
        height: s * 0.66,
        rx: s * 0.12,
        ry: s * 0.12,
        fill: DEFAULT_FILL,
      });
      break;
    case "circle":
      obj = new Circle({ ...common, radius: s / 2, fill: DEFAULT_FILL });
      break;
    case "ellipse":
      obj = new Ellipse({ ...common, rx: s / 2, ry: s * 0.32, fill: DEFAULT_FILL });
      break;
    case "triangle":
      obj = new Triangle({ ...common, width: s, height: s, fill: DEFAULT_FILL });
      break;
    case "line":
      obj = new Line([0, 0, s, 0], {
        ...common,
        stroke: DEFAULT_LINE,
        strokeWidth: Math.max(4, w * 0.012),
        strokeLineCap: "round",
      });
      break;
    case "star":
      obj = new Polygon(starPoints(s / 2, s / 4), { ...common, fill: DEFAULT_FILL });
      break;
    case "hexagon":
      obj = new Polygon(regularPolygonPoints(6, s / 2), { ...common, fill: DEFAULT_FILL });
      break;
    case "arrow":
      obj = new Polygon(
        [
          { x: 0, y: 30 }, { x: 60, y: 30 }, { x: 60, y: 8 }, { x: 100, y: 50 },
          { x: 60, y: 92 }, { x: 60, y: 70 }, { x: 0, y: 70 },
        ],
        { ...common, fill: DEFAULT_FILL, scaleX: s / 100, scaleY: s / 100 }
      );
      break;
    case "heart":
      obj = new Path(
        "M 50 88 C 0 55 0 20 25 20 C 40 20 50 35 50 35 C 50 35 60 20 75 20 C 100 20 100 55 50 88 Z",
        { ...common, fill: DEFAULT_FILL, scaleX: s / 100, scaleY: s / 100 }
      );
      break;
    default:
      obj = new Rect({ ...common, width: s, height: s, fill: DEFAULT_FILL });
  }

  const meta = obj as EditorObject;
  meta.id = uid();
  meta.isShape = true;
  meta.shapeType = type;
  meta.layerName = SHAPE_DEFS.find((d) => d.type === type)?.label ?? "শেপ";
  return obj;
}

export function addShape(canvas: Canvas, type: ShapeType): FabricObject {
  const obj = makeShape(canvas, type);
  canvas.add(obj);
  canvas.setActiveObject(obj);
  canvas.requestRenderAll();
  return obj;
}
