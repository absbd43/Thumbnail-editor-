"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { exportCanvas, EXPORT_SIZES } from "@/lib/exportUtils";
import BottomSheet from "@/components/ui/BottomSheet";
import Slider from "@/components/ui/Slider";

type Format = "png" | "png-transparent" | "jpeg";

/** Export panel — high-resolution PNG/JPG download (up to 4320px, 300 DPI print). */
export default function ExportPanel({ onSave }: { onSave: () => Promise<void> | void }) {
  const canvas = useEditorStore((s) => s.canvas);
  const designId = useEditorStore((s) => s.designId);
  const width = useEditorStore((s) => s.width);
  const height = useEditorStore((s) => s.height);
  const closePanel = useEditorStore((s) => s.closePanel);

  const [format, setFormat] = useState<Format>("png");
  const [sizeIdx, setSizeIdx] = useState(0);
  const [quality, setQuality] = useState(0.92);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!canvas) return null;

  const outW = EXPORT_SIZES[sizeIdx].px;
  const outH = Math.round((outW * height) / width);

  const doExport = async () => {
    setBusy(true);
    setDone(false);
    try {
      // Save first so the exported state is never lost
      await onSave();
      await exportCanvas(canvas, {
        format: format === "jpeg" ? "jpeg" : "png",
        size: outW,
        transparent: format === "png-transparent",
        quality,
      });
      // Exported designs are no longer "just drafts"
      if (designId) {
        void fetch(`/api/designs/${designId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isDraft: false }),
        });
      }
      setDone(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <BottomSheet title="এক্সপোর্ট" onClose={closePanel}>
      <div className="mb-3">
        <div className="mb-1 text-xs font-medium text-zinc-600">ফরম্যাট</div>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-zinc-100 p-1">
          {(
            [
              ["png", "PNG"],
              ["png-transparent", "স্বচ্ছ PNG"],
              ["jpeg", "JPG"],
            ] as [Format, string][]
          ).map(([f, label]) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`rounded-lg py-2 text-xs font-semibold ${
                format === f ? "bg-white text-indigo-700 shadow-sm" : "text-zinc-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <div className="mb-1 text-xs font-medium text-zinc-600">কোয়ালিটি / রেজোলিউশন</div>
        <div className="grid grid-cols-2 gap-2">
          {EXPORT_SIZES.map((s, i) => (
            <button
              key={s.px}
              onClick={() => setSizeIdx(i)}
              className={`rounded-xl border p-2.5 text-left ${
                sizeIdx === i ? "border-indigo-600 bg-indigo-50" : "border-zinc-200"
              }`}
            >
              <div className="text-xs font-bold text-zinc-800">{s.label}</div>
              <div className="text-[10px] text-zinc-500">
                {Math.round((s.px * width) / width)} × {Math.round((s.px * height) / width)} px
                {i === 3 && " · 300 DPI"}
              </div>
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[10px] leading-relaxed text-zinc-400">
          এক্সপোর্টের সময় পুরো ডিজাইন ভেক্টর থেকে নতুন করে রেন্ডার হয় — তাই বাংলা টেক্সট
          যেকোনো রেজোলিউশনে একদম শার্প থাকে, কোনো ব্লার বা পিক্সেলেশন হয় না।
        </p>
      </div>

      {format === "jpeg" && (
        <Slider
          label="JPG কোয়ালিটি"
          min={0.6}
          max={1}
          step={0.01}
          value={quality}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={setQuality}
        />
      )}

      <button
        onClick={() => void doExport()}
        disabled={busy}
        className="mt-2 w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white active:bg-indigo-700 disabled:opacity-60"
      >
        {busy ? `রেন্ডার হচ্ছে (${outW}×${outH})…` : done ? "✓ ডাউনলোড হয়েছে — আবার এক্সপোর্ট?" : `ডাউনলোড করুন (${outW}×${outH})`}
      </button>
    </BottomSheet>
  );
}
