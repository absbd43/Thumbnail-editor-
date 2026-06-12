"use client";

import { useState } from "react";
import DesignsTab from "./DesignsTab";
import TemplatesTab from "./TemplatesTab";
import LogosTab from "./LogosTab";
import BrandTab from "./BrandTab";
import NewDesignModal from "./NewDesignModal";

type Tab = "designs" | "templates" | "logos" | "brand";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "designs",
    label: "আমার ডিজাইন",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" />
      </svg>
    ),
  },
  {
    id: "templates",
    label: "টেমপ্লেট",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 9v12" />
      </svg>
    ),
  },
  {
    id: "logos",
    label: "আমার লোগো",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" /><path d="m9 12 2 2 4-5" />
      </svg>
    ),
  },
  {
    id: "brand",
    label: "ব্র্যান্ড",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

/** Mobile-first dashboard: bottom tab navigation + floating "new design" button. */
export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("designs");
  const [showNewModal, setShowNewModal] = useState(false);

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-bold text-zinc-900">
          বাংলা <span className="text-indigo-600">থাম্বনেইল</span> এডিটর
        </h1>
        <p className="text-xs text-zinc-500">মোবাইল থেকেই প্রফেশনাল বাংলা গ্রাফিক্স</p>
      </header>

      <main className="flex-1 px-4 pb-28 pt-4">
        {tab === "designs" && <DesignsTab onNew={() => setShowNewModal(true)} />}
        {tab === "templates" && <TemplatesTab />}
        {tab === "logos" && <LogosTab />}
        {tab === "brand" && <BrandTab />}
      </main>

      {/* Floating new-design button */}
      <button
        onClick={() => setShowNewModal(true)}
        aria-label="নতুন ডিজাইন"
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-300 transition-transform active:scale-90"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {/* Bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-3xl grid-cols-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
                tab === t.id ? "text-indigo-600" : "text-zinc-400"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {showNewModal && <NewDesignModal onClose={() => setShowNewModal(false)} />}
    </div>
  );
}
