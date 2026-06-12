"use client";

import { useEffect, useState } from "react";
import type { BrandSettings, LogoRecord } from "@/types";
import { DEFAULT_BRAND_SETTINGS } from "@/types";
import { BUILTIN_FONTS } from "@/lib/fonts";
import ColorPicker from "@/components/ui/ColorPicker";

/** Brand defaults — applied automatically to every new project. */
export default function BrandTab() {
  const [settings, setSettings] = useState<BrandSettings>(DEFAULT_BRAND_SETTINGS);
  const [logos, setLogos] = useState<LogoRecord[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    fetch("/api/brand").then((r) => r.json()).then(setSettings).catch(() => {});
    fetch("/api/logos").then((r) => r.json()).then((d) => setLogos(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const save = async () => {
    setStatus("saving");
    await fetch("/api/brand", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2000);
  };

  const set = <K extends keyof BrandSettings>(key: K, value: BrandSettings[K]) =>
    setSettings((s) => ({ ...s, [key]: value }));

  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500">
        এই সেটিংসগুলো প্রতিটি নতুন ডিজাইনে স্বয়ংক্রিয়ভাবে প্রয়োগ হবে।
      </p>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-zinc-700">ডিফল্ট ফন্ট</span>
        <select
          value={settings.defaultFont}
          onChange={(e) => set("defaultFont", e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm"
        >
          {BUILTIN_FONTS.map((f) => (
            <option key={f.family} value={f.family}>
              {f.label} ({f.family})
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-zinc-700">ডিফল্ট ফন্ট সাইজ</span>
        <input
          type="number"
          min={10}
          max={400}
          value={settings.defaultFontSize}
          onChange={(e) => set("defaultFontSize", Number(e.target.value))}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm"
        />
      </label>

      <div>
        <span className="mb-1 block text-xs font-semibold text-zinc-700">ডিফল্ট টেক্সট রং</span>
        <ColorPicker value={settings.defaultTextColor} onChange={(c) => set("defaultTextColor", c)} />
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-zinc-700">ডিফল্ট লোগো</span>
        <select
          value={settings.defaultLogoId ?? ""}
          onChange={(e) => set("defaultLogoId", e.target.value || null)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm"
        >
          <option value="">কোনোটি নয়</option>
          {logos.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-zinc-700">
          ডিফল্ট ওয়াটারমার্ক <span className="font-normal text-zinc-400">(যেমন: আপনার পেজের নাম)</span>
        </span>
        <input
          type="text"
          value={settings.watermarkText}
          onChange={(e) => set("watermarkText", e.target.value)}
          placeholder="যেমন: My Page"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm"
        />
      </label>

      <div>
        <span className="mb-1 block text-xs font-semibold text-zinc-700">ডিফল্ট ক্যানভাস সাইজ</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={settings.canvasWidth}
            min={100}
            max={5000}
            onChange={(e) => set("canvasWidth", Number(e.target.value))}
            className="w-28 rounded-lg border border-zinc-300 px-3 py-2.5 text-sm"
            aria-label="প্রস্থ"
          />
          <span className="text-zinc-400">×</span>
          <input
            type="number"
            value={settings.canvasHeight}
            min={100}
            max={5000}
            onChange={(e) => set("canvasHeight", Number(e.target.value))}
            className="w-28 rounded-lg border border-zinc-300 px-3 py-2.5 text-sm"
            aria-label="উচ্চতা"
          />
        </div>
      </div>

      <button
        onClick={save}
        disabled={status === "saving"}
        className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white active:bg-indigo-700 disabled:opacity-60"
      >
        {status === "saving" ? "সেভ হচ্ছে…" : status === "saved" ? "✓ সেভ হয়েছে" : "সেভ করুন"}
      </button>
    </div>
  );
}
