"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { DesignSummary } from "@/types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "এইমাত্র";
  if (mins < 60) return `${mins} মিনিট আগে`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ঘণ্টা আগে`;
  return `${Math.floor(hrs / 24)} দিন আগে`;
}

/** "My Designs" — saved designs & auto-saved drafts with recover/rename/delete. */
export default function DesignsTab({ onNew }: { onNew: () => void }) {
  const router = useRouter();
  const [designs, setDesigns] = useState<DesignSummary[] | null>(null);

  const load = () =>
    fetch("/api/designs")
      .then((r) => r.json())
      .then((d) => setDesigns(Array.isArray(d) ? d : []))
      .catch(() => setDesigns([]));

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("এই ডিজাইনটি মুছে ফেলবেন?")) return;
    await fetch(`/api/designs/${id}`, { method: "DELETE" });
    load();
  };

  const rename = async (d: DesignSummary) => {
    const name = prompt("নতুন নাম দিন:", d.name);
    if (!name || name === d.name) return;
    await fetch(`/api/designs/${d.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    load();
  };

  if (designs === null) {
    return <div className="py-16 text-center text-sm text-zinc-400">লোড হচ্ছে…</div>;
  }

  if (designs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="text-4xl">🎨</div>
        <p className="text-sm text-zinc-500">এখনো কোনো ডিজাইন নেই</p>
        <button
          onClick={onNew}
          className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white active:bg-indigo-700"
        >
          + প্রথম ডিজাইন তৈরি করুন
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {designs.map((d) => (
        <div key={d.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <button
            className="block w-full"
            onClick={() => router.push(`/editor?id=${d.id}`)}
            aria-label={`${d.name} খুলুন`}
          >
            {d.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.thumbnail} alt={d.name} className="aspect-square w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center bg-zinc-100 text-3xl">📄</div>
            )}
          </button>
          <div className="px-2.5 py-2">
            <div className="flex items-center gap-1">
              <span className="flex-1 truncate text-xs font-semibold text-zinc-800">{d.name}</span>
              {d.isDraft && (
                <span className="rounded bg-amber-100 px-1 py-0.5 text-[9px] font-medium text-amber-700">ড্রাফট</span>
              )}
            </div>
            <div className="mt-0.5 flex items-center justify-between">
              <span className="text-[10px] text-zinc-400">{timeAgo(d.updatedAt)}</span>
              <span className="flex gap-2">
                <button onClick={() => rename(d)} aria-label="নাম পরিবর্তন" className="text-zinc-400 active:text-indigo-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                </button>
                <button onClick={() => remove(d.id)} aria-label="মুছুন" className="text-zinc-400 active:text-red-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  </svg>
                </button>
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
