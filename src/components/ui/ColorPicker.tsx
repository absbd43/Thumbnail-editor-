"use client";

const SWATCHES = [
  "#ffffff", "#000000", "#ef4444", "#f97316", "#facc15", "#22c55e",
  "#10b981", "#06b6d4", "#3b82f6", "#60a5fa", "#8b5cf6", "#d946ef",
  "#f472b6", "#fb7185", "#fde047", "#a3e635", "#94a3b8", "#1e293b",
];

/** Swatch row + native color input for custom colors. */
export default function ColorPicker({
  value,
  onChange,
  label,
  swatches = SWATCHES,
}: {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  /** Override the default palette (e.g. background-specific colors). */
  swatches?: string[];
}) {
  return (
    <div className="py-1.5">
      {label && <div className="mb-1 text-xs font-medium text-zinc-600">{label}</div>}
      <div className="flex flex-wrap items-center gap-1.5">
        {swatches.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            aria-label={c}
            className={`h-8 w-8 rounded-full border-2 transition-transform active:scale-90 ${
              value === c ? "border-indigo-600 ring-2 ring-indigo-200" : "border-zinc-200"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
        <label
          className="relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-zinc-300 text-[10px] text-zinc-500"
          style={{
            background:
              "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
          }}
        >
          <input
            type="color"
            value={value.startsWith("#") ? value : "#ffffff"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="কাস্টম রং"
          />
        </label>
      </div>
    </div>
  );
}
