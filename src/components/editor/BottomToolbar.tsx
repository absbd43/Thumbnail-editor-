"use client";

import { useEditorStore, type PanelId } from "@/store/editorStore";

const TOOLS: { id: PanelId; label: string; icon: React.ReactNode }[] = [
  {
    id: "text",
    label: "টেক্সট",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 7V5h16v2M9 19h6M12 5v14" />
      </svg>
    ),
  },
  {
    id: "background",
    label: "ব্যাকগ্রাউন্ড",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
      </svg>
    ),
  },
  {
    id: "logo",
    label: "লোগো",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" /><path d="m9 12 2 2 4-5" />
      </svg>
    ),
  },
  {
    id: "layers",
    label: "লেয়ার",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m12 2 10 6.5L12 15 2 8.5 12 2zM2 13.5 12 20l10-6.5" />
      </svg>
    ),
  },
  {
    id: "templates",
    label: "টেমপ্লেট",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 9v12" />
      </svg>
    ),
  },
  {
    id: "export",
    label: "এক্সপোর্ট",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
      </svg>
    ),
  },
];

/** Large touch-friendly bottom toolbar — the editor's main navigation. */
export default function BottomToolbar() {
  const activePanel = useEditorStore((s) => s.activePanel);
  const openPanel = useEditorStore((s) => s.openPanel);

  return (
    <nav className="z-30 border-t border-zinc-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid h-16 max-w-3xl grid-cols-6">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => openPanel(t.id)}
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${
              activePanel === t.id ? "text-indigo-600" : "text-zinc-500"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
