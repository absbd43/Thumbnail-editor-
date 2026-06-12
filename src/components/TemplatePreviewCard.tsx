"use client";

import type { TemplateSpec } from "@/types";

/**
 * Lightweight CSS preview of a template (no canvas needed),
 * used on the dashboard and in the editor's template panel.
 */
export default function TemplatePreviewCard({
  spec,
  onClick,
}: {
  spec: TemplateSpec;
  onClick: () => void;
}) {
  const bg =
    spec.background.type === "solid"
      ? spec.background.color
      : `linear-gradient(${(spec.background.angle ?? 90) + 90}deg, ${spec.background.colors[0]}, ${spec.background.colors[1]})`;

  return (
    <button
      onClick={onClick}
      className="group overflow-hidden rounded-xl border border-zinc-200 bg-white text-left shadow-sm transition-transform active:scale-95"
    >
      <div
        className="relative flex aspect-square w-full flex-col items-center justify-center gap-1 overflow-hidden p-2"
        style={{ background: bg }}
      >
        {spec.texts.slice(0, 3).map((t, i) => (
          <span
            key={i}
            className="max-w-full truncate text-center leading-tight"
            style={{
              color: t.fill,
              fontFamily: `"${t.fontFamily}", sans-serif`,
              fontWeight: Number(t.fontWeight) || 400,
              fontSize: `${Math.max(8, t.fontSize * 140)}px`,
            }}
          >
            {/* Word-level colors in the preview too */}
            {t.wordColors
              ? t.text.split("\n")[t.text.includes("\n") ? 1 : 0].split(" ").map((word, wi) => (
                  <span key={wi} style={{ color: t.wordColors?.[word] ?? t.fill }}>
                    {word}{" "}
                  </span>
                ))
              : t.text.split("\n")[0]}
          </span>
        ))}
      </div>
      <div className="px-2.5 py-2 text-xs font-medium text-zinc-700">{spec.name}</div>
    </button>
  );
}
