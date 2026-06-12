"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useCommit } from "@/hooks/useCommit";
import { addImage } from "@/lib/fabricHelpers";
import { fileToDataURL } from "@/components/dashboard/LogosTab";
import BottomSheet from "@/components/ui/BottomSheet";
import type { LogoRecord } from "@/types";

/** Logo panel — one tap inserts a saved logo from "My Logos". */
export default function LogoPanel() {
  const canvas = useEditorStore((s) => s.canvas);
  const closePanel = useEditorStore((s) => s.closePanel);
  const commit = useCommit();
  const [logos, setLogos] = useState<LogoRecord[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/logos")
      .then((r) => r.json())
      .then((d) => setLogos(Array.isArray(d) ? d : []))
      .catch(() => setLogos([]));
  }, []);

  if (!canvas) return null;

  const insert = async (logo: LogoRecord) => {
    await addImage(canvas, logo.data, { isLogo: true, name: logo.name });
    commit();
    closePanel();
  };

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const data = await fileToDataURL(file);
      const res = await fetch("/api/logos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name.replace(/\.[^.]+$/, ""), data }),
      });
      const logo = (await res.json()) as LogoRecord;
      setLogos((l) => [logo, ...(l ?? [])]);
      await insert(logo);
    } finally {
      setUploading(false);
    }
  };

  return (
    <BottomSheet title="আমার লোগো" onClose={closePanel}>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        hidden
        onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="mb-3 w-full rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 py-3 text-sm font-semibold text-indigo-600 active:bg-indigo-100 disabled:opacity-50"
      >
        {uploading ? "আপলোড হচ্ছে…" : "+ নতুন লোগো আপলোড করুন"}
      </button>

      {logos === null ? (
        <p className="py-6 text-center text-xs text-zinc-400">লোড হচ্ছে…</p>
      ) : logos.length === 0 ? (
        <p className="py-6 text-center text-xs text-zinc-400">
          কোনো সেভ করা লোগো নেই — একবার আপলোড করলে সব ডিজাইনে পাবেন।
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {logos.map((l) => (
            <button
              key={l.id}
              onClick={() => void insert(l)}
              className="relative flex aspect-square items-center justify-center rounded-lg border border-zinc-200 bg-[repeating-conic-gradient(#f4f4f5_0%_25%,#fff_0%_50%)] bg-[length:14px_14px] p-1.5 active:border-indigo-400"
              aria-label={`${l.name} যোগ করুন`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.data} alt={l.name} className="max-h-full max-w-full object-contain" loading="lazy" />
              {l.isDefault && (
                <span className="absolute left-0.5 top-0.5 rounded bg-indigo-600 px-1 text-[8px] font-bold text-white">★</span>
              )}
            </button>
          ))}
        </div>
      )}
    </BottomSheet>
  );
}
