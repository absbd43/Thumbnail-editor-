"use client";

import { useRouter } from "next/navigation";
import { useEditorStore } from "@/store/editorStore";

/** Editor header: back, design name, undo/redo, zoom, save status. */
export default function TopBar({ onSave }: { onSave: () => void }) {
  const router = useRouter();
  const designName = useEditorStore((s) => s.designName);
  const setDesignName = useEditorStore((s) => s.setDesignName);
  const historyIndex = useEditorStore((s) => s.historyIndex);
  const historyLen = useEditorStore((s) => s.history.length);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const zoom = useEditorStore((s) => s.zoom);
  const fitZoom = useEditorStore((s) => s.fitZoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const saveStatus = useEditorStore((s) => s.saveStatus);

  const statusLabel = {
    saved: "✓ সেভড",
    saving: "সেভ হচ্ছে…",
    unsaved: "অসংরক্ষিত",
    error: "⚠ সেভ ব্যর্থ",
  }[saveStatus];

  return (
    <header className="z-20 border-b border-zinc-200 bg-white">
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <button
          onClick={() => {
            void onSave();
            router.push("/");
          }}
          aria-label="ড্যাশবোর্ডে ফিরুন"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-600 active:bg-zinc-100"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <input
          value={designName}
          onChange={(e) => setDesignName(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm font-semibold text-zinc-800 focus:border-zinc-300 focus:outline-none"
          aria-label="ডিজাইনের নাম"
        />

        <span
          className={`shrink-0 text-[10px] font-medium ${
            saveStatus === "error" ? "text-red-500" : saveStatus === "saved" ? "text-emerald-600" : "text-zinc-400"
          }`}
        >
          {statusLabel}
        </span>

        <button
          onClick={() => void undo()}
          disabled={historyIndex <= 0}
          aria-label="আনডু"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-600 active:bg-zinc-100 disabled:opacity-30"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>
        <button
          onClick={() => void redo()}
          disabled={historyIndex >= historyLen - 1}
          aria-label="রিডু"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-600 active:bg-zinc-100 disabled:opacity-30"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
          </svg>
        </button>
      </div>

      {/* Zoom row */}
      <div className="flex items-center justify-center gap-1 border-t border-zinc-100 py-1">
        <button
          onClick={() => setZoom(zoom / 1.25)}
          aria-label="জুম আউট"
          className="flex h-7 w-9 items-center justify-center rounded text-zinc-500 active:bg-zinc-100"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3M8 11h6" />
          </svg>
        </button>
        <button
          onClick={() => setZoom(fitZoom)}
          className="min-w-14 rounded px-2 py-1 text-xs font-medium tabular-nums text-zinc-600 active:bg-zinc-100"
          aria-label="স্ক্রিনে ফিট করুন"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={() => setZoom(zoom * 1.25)}
          aria-label="জুম ইন"
          className="flex h-7 w-9 items-center justify-center rounded text-zinc-500 active:bg-zinc-100"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3M11 8v6M8 11h6" />
          </svg>
        </button>
      </div>
    </header>
  );
}
