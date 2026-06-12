"use client";

import { useRef, useState } from "react";
import { FabricImage, Gradient } from "fabric";
import { useEditorStore } from "@/store/editorStore";
import { useCommit } from "@/hooks/useCommit";
import {
  removeImageBackground,
  setGradientBackground,
  setImageBackground,
  setSolidBackground,
  updateBackgroundImage,
} from "@/lib/fabricHelpers";
import { fileToDataURL } from "@/components/dashboard/LogosTab";
import BottomSheet from "@/components/ui/BottomSheet";
import ColorPicker from "@/components/ui/ColorPicker";
import Slider from "@/components/ui/Slider";

const GRADIENT_PRESETS: [string, string][] = [
  ["#0f172a", "#1e3a8a"], ["#064e3b", "#10b981"], ["#7c2d12", "#f59e0b"],
  ["#312e81", "#7c3aed"], ["#831843", "#db2777"], ["#0c4a6e", "#0ea5e9"],
  ["#18181b", "#52525b"], ["#7f1d1d", "#ef4444"], ["#1a2e05", "#65a30d"],
  ["#451a03", "#d97706"], ["#2e1065", "#a855f7"], ["#134e4a", "#14b8a6"],
];

type Mode = "solid" | "gradient" | "image";

/** Background panel: solid colors, gradients, uploaded images with blur & opacity. */
export default function BackgroundPanel() {
  const canvas = useEditorStore((s) => s.canvas);
  const closePanel = useEditorStore((s) => s.closePanel);
  useEditorStore((s) => s.selectionVersion);
  const commit = useCommit();
  const fileRef = useRef<HTMLInputElement>(null);

  const bgImage = canvas?.backgroundImage as FabricImage | undefined;
  const isGradient = canvas?.backgroundColor instanceof Gradient;

  const [mode, setMode] = useState<Mode>(bgImage ? "image" : isGradient ? "gradient" : "solid");
  const [lastPair, setLastPair] = useState<[string, string]>(GRADIENT_PRESETS[0]);
  const [angle, setAngle] = useState(135);
  const [solid, setSolid] = useState("#1e293b");
  const [uploading, setUploading] = useState(false);

  if (!canvas) return null;

  const blurValue = (bgImage?.filters?.[0] as { blur?: number } | undefined)?.blur ?? 0;

  const pickImage = async (file: File) => {
    setUploading(true);
    try {
      const dataUrl = await fileToDataURL(file);
      await setImageBackground(canvas, dataUrl);
      commit();
    } finally {
      setUploading(false);
    }
  };

  return (
    <BottomSheet title="ব্যাকগ্রাউন্ড" onClose={closePanel}>
      <div className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-zinc-100 p-1">
        {(
          [
            ["solid", "রঙ"],
            ["gradient", "গ্রেডিয়েন্ট"],
            ["image", "ছবি"],
          ] as [Mode, string][]
        ).map(([m, label]) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-lg py-2 text-xs font-semibold ${
              mode === m ? "bg-white text-indigo-700 shadow-sm" : "text-zinc-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "solid" && (
        <ColorPicker
          value={solid}
          onChange={(c) => {
            setSolid(c);
            setSolidBackground(canvas, c);
            commit();
          }}
        />
      )}

      {mode === "gradient" && (
        <div>
          <div className="grid grid-cols-6 gap-2 py-1">
            {GRADIENT_PRESETS.map((pair) => (
              <button
                key={pair.join()}
                onClick={() => {
                  setLastPair(pair);
                  setGradientBackground(canvas, pair, angle);
                  commit();
                }}
                aria-label={`গ্রেডিয়েন্ট ${pair.join(" → ")}`}
                className={`h-12 rounded-lg border-2 ${
                  lastPair === pair ? "border-indigo-600" : "border-transparent"
                }`}
                style={{ background: `linear-gradient(${angle + 90}deg, ${pair[0]}, ${pair[1]})` }}
              />
            ))}
          </div>
          <Slider
            label="অ্যাঙ্গেল"
            min={0}
            max={360}
            step={15}
            value={angle}
            format={(v) => `${v}°`}
            onChange={(v) => {
              setAngle(v);
              setGradientBackground(canvas, lastPair, v);
              commit();
            }}
          />
        </div>
      )}

      {mode === "image" && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => e.target.files?.[0] && void pickImage(e.target.files[0])}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 py-4 text-sm font-semibold text-indigo-600 active:bg-indigo-100 disabled:opacity-50"
          >
            {uploading ? "লোড হচ্ছে…" : bgImage ? "অন্য ছবি দিন" : "+ ব্যাকগ্রাউন্ড ছবি আপলোড"}
          </button>

          {bgImage && (
            <div className="mt-2">
              <Slider
                label="ব্লার"
                min={0}
                max={1}
                step={0.05}
                value={blurValue}
                format={(v) => `${Math.round(v * 100)}%`}
                onChange={(v) => {
                  updateBackgroundImage(canvas, { blur: v });
                  commit();
                }}
              />
              <Slider
                label="অপাসিটি"
                min={0.1}
                max={1}
                step={0.05}
                value={bgImage.opacity ?? 1}
                format={(v) => `${Math.round(v * 100)}%`}
                onChange={(v) => {
                  updateBackgroundImage(canvas, { opacity: v });
                  commit();
                }}
              />
              <button
                onClick={() => {
                  removeImageBackground(canvas);
                  commit();
                }}
                className="mt-1 w-full rounded-lg border border-red-200 py-2.5 text-xs font-semibold text-red-600 active:bg-red-50"
              >
                ছবি সরিয়ে ফেলুন
              </button>
            </div>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
