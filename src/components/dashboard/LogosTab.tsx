"use client";

import { useEffect, useRef, useState } from "react";
import type { LogoRecord } from "@/types";

/** Reads a file as a base64 data URL. */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/** "My Logos" — upload, rename, delete, set default. Persisted across all projects. */
export default function LogosTab() {
  const [logos, setLogos] = useState<LogoRecord[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const load = () =>
    fetch("/api/logos")
      .then((r) => r.json())
      .then((d) => setLogos(Array.isArray(d) ? d : []))
      .catch(() => setLogos([]));

  useEffect(() => {
    load();
  }, []);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const data = await fileToDataURL(file);
      await fetch("/api/logos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name.replace(/\.[^.]+$/, ""), data }),
      });
      await load();
    } finally {
      setUploading(false);
    }
  };

  const setDefault = async (id: string) => {
    await fetch(`/api/logos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    load();
  };

  const rename = async (l: LogoRecord) => {
    const name = prompt("লোগোর নতুন নাম:", l.name);
    if (!name || name === l.name) return;
    await fetch(`/api/logos/${l.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("লোগোটি মুছে ফেলবেন?")) return;
    await fetch(`/api/logos/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        hidden
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="mb-4 w-full rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 py-4 text-sm font-semibold text-indigo-600 active:bg-indigo-100 disabled:opacity-50"
      >
        {uploading ? "আপলোড হচ্ছে…" : "+ নতুন লোগো আপলোড করুন"}
      </button>

      {logos === null ? (
        <div className="py-10 text-center text-sm text-zinc-400">লোড হচ্ছে…</div>
      ) : logos.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500">
          কোনো লোগো নেই। একবার আপলোড করলে সব প্রজেক্টে এক ক্লিকে ব্যবহার করতে পারবেন।
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {logos.map((l) => (
            <div key={l.id} className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
              <div className="relative flex aspect-square items-center justify-center rounded-lg bg-[repeating-conic-gradient(#f4f4f5_0%_25%,#fff_0%_50%)] bg-[length:16px_16px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.data} alt={l.name} className="max-h-full max-w-full object-contain p-2" loading="lazy" />
                {l.isDefault && (
                  <span className="absolute left-1 top-1 rounded bg-indigo-600 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                    ডিফল্ট
                  </span>
                )}
              </div>
              <div className="mt-2 truncate text-xs font-semibold text-zinc-800">{l.name}</div>
              <div className="mt-1.5 flex items-center justify-between text-zinc-400">
                <button
                  onClick={() => setDefault(l.id)}
                  aria-label="ডিফল্ট করুন"
                  className={l.isDefault ? "text-amber-500" : "active:text-amber-500"}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={l.isDefault ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                  </svg>
                </button>
                <button onClick={() => rename(l)} aria-label="নাম পরিবর্তন" className="active:text-indigo-600">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                </button>
                <button onClick={() => remove(l.id)} aria-label="মুছুন" className="active:text-red-600">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
