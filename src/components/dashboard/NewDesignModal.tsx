"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SIZE_PRESETS = [
  { label: "স্কয়ার পোস্ট", sub: "1080 × 1080", w: 1080, h: 1080 },
  { label: "স্টোরি / রিল", sub: "1080 × 1920", w: 1080, h: 1920 },
  { label: "ইউটিউব থাম্বনেইল", sub: "1280 × 720", w: 1280, h: 720 },
  { label: "পোর্ট্রেট পোস্ট", sub: "1080 × 1350", w: 1080, h: 1350 },
];

/** Canvas-size chooser shown before creating a new design. */
export default function NewDesignModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [custom, setCustom] = useState(false);
  const [cw, setCw] = useState(1080);
  const [ch, setCh] = useState(1080);
  const [busy, setBusy] = useState(false);

  const create = (w: number, h: number) => {
    if (busy) return;
    setBusy(true);
    router.push(`/editor?new=1&w=${w}&h=${h}`);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-base font-bold text-zinc-900">নতুন ডিজাইন — সাইজ বাছাই করুন</h2>
        <div className="grid grid-cols-2 gap-2">
          {SIZE_PRESETS.map((p) => (
            <button
              key={p.sub}
              disabled={busy}
              onClick={() => create(p.w, p.h)}
              className="rounded-xl border border-zinc-200 p-3 text-left hover:border-indigo-400 active:bg-indigo-50"
            >
              <div className="text-sm font-semibold text-zinc-800">{p.label}</div>
              <div className="text-xs text-zinc-500">{p.sub}</div>
            </button>
          ))}
        </div>

        <button
          onClick={() => setCustom(!custom)}
          className="mt-3 text-sm font-medium text-indigo-600"
        >
          কাস্টম সাইজ {custom ? "▲" : "▼"}
        </button>
        {custom && (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              value={cw}
              min={100}
              max={5000}
              onChange={(e) => setCw(Number(e.target.value))}
              className="w-24 rounded-lg border border-zinc-300 px-2 py-2 text-sm"
              aria-label="প্রস্থ"
            />
            <span className="text-zinc-400">×</span>
            <input
              type="number"
              value={ch}
              min={100}
              max={5000}
              onChange={(e) => setCh(Number(e.target.value))}
              className="w-24 rounded-lg border border-zinc-300 px-2 py-2 text-sm"
              aria-label="উচ্চতা"
            />
            <button
              disabled={busy}
              onClick={() => create(cw, ch)}
              className="ml-auto rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white active:bg-indigo-700"
            >
              তৈরি করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
