"use client";

import { Rect } from "fabric";
import { useEditorStore } from "@/store/editorStore";
import { useCommit } from "@/hooks/useCommit";
import { addShape, isLineShape, isShape, SHAPE_DEFS, type ShapeType } from "@/lib/shapes";
import BottomSheet from "@/components/ui/BottomSheet";
import ColorPicker from "@/components/ui/ColorPicker";
import Slider from "@/components/ui/Slider";

/** Small CSS icon for each shape in the add grid. */
function ShapeIcon({ type }: { type: ShapeType }) {
  const c = "#4f46e5";
  switch (type) {
    case "rect":
      return <div style={{ width: 26, height: 18, background: c }} />;
    case "roundRect":
      return <div style={{ width: 26, height: 18, background: c, borderRadius: 6 }} />;
    case "circle":
      return <div style={{ width: 22, height: 22, background: c, borderRadius: "50%" }} />;
    case "ellipse":
      return <div style={{ width: 26, height: 16, background: c, borderRadius: "50%" }} />;
    case "line":
      return <div style={{ width: 26, height: 4, background: c, borderRadius: 2 }} />;
    default:
      return (
        <svg width="24" height="24" viewBox="0 0 100 100">
          {type === "triangle" && <polygon points="50,8 92,92 8,92" fill={c} />}
          {type === "star" && (
            <polygon points="50,5 61,38 96,38 68,59 79,93 50,72 21,93 32,59 4,38 39,38" fill={c} />
          )}
          {type === "hexagon" && <polygon points="50,5 93,28 93,72 50,95 7,72 7,28" fill={c} />}
          {type === "arrow" && (
            <polygon points="0,35 60,35 60,12 100,50 60,88 60,65 0,65" fill={c} />
          )}
          {type === "heart" && (
            <path d="M 50 88 C 0 55 0 20 25 20 C 40 20 50 35 50 35 C 50 35 60 20 75 20 C 100 20 100 55 50 88 Z" fill={c} />
          )}
        </svg>
      );
  }
}

/** Shapes panel: add shapes, and edit the selected shape's color, stroke & opacity. */
export default function ShapesPanel() {
  const canvas = useEditorStore((s) => s.canvas);
  const selected = useEditorStore((s) => s.selectedObject);
  useEditorStore((s) => s.selectionVersion);
  const closePanel = useEditorStore((s) => s.closePanel);
  const commit = useCommit();

  if (!canvas) return null;

  const shape = isShape(selected) ? selected! : null;
  const line = isLineShape(shape);
  const isRect = shape instanceof Rect;

  const apply = (props: Record<string, unknown>) => {
    if (!shape) return;
    shape.set(props);
    shape.set("dirty", true);
    canvas.requestRenderAll();
    commit();
  };

  return (
    <BottomSheet title="শেপ" onClose={closePanel}>
      <div className="mb-1 text-xs font-medium text-zinc-600">শেপ যোগ করুন</div>
      <div className="grid grid-cols-5 gap-2">
        {SHAPE_DEFS.map((d) => (
          <button
            key={d.type}
            onClick={() => {
              addShape(canvas, d.type);
              commit();
            }}
            aria-label={d.label}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white active:border-indigo-400 active:bg-indigo-50"
          >
            <ShapeIcon type={d.type} />
            <span className="text-[9px] text-zinc-500">{d.label}</span>
          </button>
        ))}
      </div>

      {!shape ? (
        <p className="mt-3 text-center text-xs text-zinc-400">
          রং বদলাতে ক্যানভাসে একটি শেপ সিলেক্ট করুন।
        </p>
      ) : (
        <div className="mt-3 border-t border-zinc-100 pt-2">
          {/* Fill (or line color) — same palette as the background */}
          <ColorPicker
            label={line ? "লাইনের রং" : "শেপের রং (ফিল)"}
            value={String((line ? shape.stroke : shape.fill) ?? "#6366f1")}
            onChange={(c) => apply(line ? { stroke: c } : { fill: c })}
          />

          {!line && (
            <>
              <Slider
                label="বর্ডার (স্ট্রোক)"
                min={0}
                max={40}
                value={Number(shape.strokeWidth) || 0}
                onChange={(v) => apply({ strokeWidth: v })}
              />
              {Number(shape.strokeWidth) > 0 && (
                <ColorPicker
                  label="বর্ডারের রং"
                  value={String(shape.stroke ?? "#000000")}
                  onChange={(c) => apply({ stroke: c })}
                />
              )}
            </>
          )}

          {line && (
            <Slider
              label="লাইনের পুরুত্ব"
              min={1}
              max={60}
              value={Number(shape.strokeWidth) || 4}
              onChange={(v) => apply({ strokeWidth: v })}
            />
          )}

          {isRect && (
            <Slider
              label="কোণের গোলত্ব"
              min={0}
              max={Math.round((shape.height ?? 100) / 2)}
              value={Number((shape as Rect).rx) || 0}
              onChange={(v) => apply({ rx: v, ry: v })}
            />
          )}

          <Slider
            label="অপাসিটি"
            min={0}
            max={1}
            step={0.05}
            value={shape.opacity ?? 1}
            format={(v) => `${Math.round(v * 100)}%`}
            onChange={(v) => apply({ opacity: v })}
          />
        </div>
      )}
    </BottomSheet>
  );
}
