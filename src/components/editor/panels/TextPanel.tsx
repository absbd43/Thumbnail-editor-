"use client";

import { useEffect, useRef, useState } from "react";
import { Shadow, Textbox } from "fabric";
import { useEditorStore } from "@/store/editorStore";
import { useCommit } from "@/hooks/useCommit";
import { addText, getTextRanges } from "@/lib/fabricHelpers";
import { BUILTIN_FONTS, ensureFontsLoaded } from "@/lib/fonts";
import { registerFontFace, saveCustomFont } from "@/lib/idb";
import BottomSheet from "@/components/ui/BottomSheet";
import ColorPicker from "@/components/ui/ColorPicker";
import Slider from "@/components/ui/Slider";

type Range = { start: number; end: number; label: string } | null;

/**
 * Text panel — the heart of the editor.
 *
 * Styling scope works at three levels:
 *  - whole text (default)
 *  - a single line  (tap a line chip)
 *  - a single word  (tap a word chip)  → e.g. দিনদার = blue, পাত্রী = pink
 */
export default function TextPanel() {
  const canvas = useEditorStore((s) => s.canvas);
  const selected = useEditorStore((s) => s.selectedObject);
  // Re-read object values whenever the canvas reports changes
  useEditorStore((s) => s.selectionVersion);
  const brand = useEditorStore((s) => s.brand);
  const customFonts = useEditorStore((s) => s.customFonts);
  const addCustomFont = useEditorStore((s) => s.addCustomFont);
  const closePanel = useEditorStore((s) => s.closePanel);
  const commit = useCommit();

  const tb = selected instanceof Textbox ? selected : null;
  const [range, setRange] = useState<Range>(null);
  const fontFileRef = useRef<HTMLInputElement>(null);

  // Reset styling scope when the selected object changes
  useEffect(() => setRange(null), [selected]);

  if (!canvas) return null;

  /** Apply style props — to the chosen word/line range when possible. */
  const apply = (props: Record<string, unknown>, rangeable = true) => {
    if (!tb) return;
    if (rangeable && range) {
      tb.setSelectionStyles(props, range.start, range.end);
    } else if (rangeable && tb.isEditing && (tb.selectionStart ?? 0) !== (tb.selectionEnd ?? 0)) {
      // User selected text with the cursor while editing
      tb.setSelectionStyles(props, tb.selectionStart, tb.selectionEnd);
    } else {
      tb.set(props);
    }
    tb.set("dirty", true);
    tb.initDimensions();
    canvas.requestRenderAll();
    commit();
  };

  const handleAddText = () => {
    addText(canvas, {
      fontFamily: brand?.defaultFont,
      fontSize: brand?.defaultFontSize,
      fill: brand?.defaultTextColor,
    });
    commit();
  };

  const handleFontUpload = async (file: File) => {
    const family = file.name.replace(/\.(ttf|otf)$/i, "");
    const buf = await file.arrayBuffer();
    await registerFontFace(family, buf);
    await saveCustomFont(family, buf);
    addCustomFont(family);
    apply({ fontFamily: family });
  };

  const changeFont = async (family: string) => {
    await ensureFontsLoaded([family]);
    apply({ fontFamily: family });
  };

  const shadow = (tb?.shadow ?? null) as Shadow | null;
  const setShadow = (patch: Partial<{ color: string; blur: number; offsetX: number; offsetY: number }> | null) => {
    if (!tb) return;
    if (patch === null) {
      tb.set("shadow", null);
    } else {
      const base = shadow ?? { color: "rgba(0,0,0,0.6)", blur: 10, offsetX: 0, offsetY: 4 };
      tb.set(
        "shadow",
        new Shadow({
          color: patch.color ?? (base.color as string),
          blur: patch.blur ?? base.blur,
          offsetX: patch.offsetX ?? base.offsetX,
          offsetY: patch.offsetY ?? base.offsetY,
        })
      );
    }
    canvas.requestRenderAll();
    commit();
  };

  const ranges = tb ? getTextRanges(tb.text ?? "") : { lines: [], words: [] };
  const allFonts = [
    ...BUILTIN_FONTS.map((f) => ({ family: f.family, label: f.label })),
    ...customFonts.map((f) => ({ family: f, label: `${f} (কাস্টম)` })),
  ];

  return (
    <BottomSheet title="টেক্সট" onClose={closePanel}>
      <button
        onClick={handleAddText}
        className="mb-3 w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white active:bg-indigo-700"
      >
        + নতুন টেক্সট যোগ করুন
      </button>

      {!tb ? (
        <p className="pb-2 text-center text-xs text-zinc-400">
          স্টাইল করতে ক্যানভাসে একটি টেক্সট সিলেক্ট করুন। লেখা বদলাতে টেক্সটে ডাবল ট্যাপ করুন।
        </p>
      ) : (
        <div className="space-y-1">
          {/* ── Styling scope: whole text / per line / per word ── */}
          <div>
            <div className="mb-1 text-xs font-medium text-zinc-600">
              কোন অংশে স্টাইল হবে?
              {range && <span className="ml-1 rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">{range.label}</span>}
            </div>
            <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
              <ScopeChip active={!range} label="পুরো টেক্সট" onClick={() => setRange(null)} />
              {ranges.lines.length > 1 &&
                ranges.lines.map((l, i) => (
                  <ScopeChip
                    key={`l${i}`}
                    active={range?.start === l.start && range?.end === l.end}
                    label={`লাইন ${i + 1}`}
                    onClick={() => setRange({ ...l, label: `লাইন ${i + 1}` })}
                  />
                ))}
              {ranges.words.length > 1 &&
                ranges.words.map((w, i) => (
                  <ScopeChip
                    key={`w${i}`}
                    active={range?.start === w.start && range?.end === w.end}
                    label={`"${w.label}"`}
                    onClick={() => setRange({ ...w, label: w.label })}
                  />
                ))}
            </div>
          </div>

          {/* ── Font family ── */}
          <div className="flex items-center gap-2">
            <select
              value={String(tb.fontFamily ?? "Hind Siliguri")}
              onChange={(e) => void changeFont(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-2 py-2.5 text-sm"
              aria-label="ফন্ট"
            >
              {allFonts.map((f) => (
                <option key={f.family} value={f.family} style={{ fontFamily: f.family }}>
                  {f.label}
                </option>
              ))}
            </select>
            <input
              ref={fontFileRef}
              type="file"
              accept=".ttf,.otf"
              hidden
              onChange={(e) => e.target.files?.[0] && void handleFontUpload(e.target.files[0])}
            />
            <button
              onClick={() => fontFileRef.current?.click()}
              className="shrink-0 rounded-lg border border-zinc-300 px-3 py-2.5 text-xs font-medium text-zinc-600 active:bg-zinc-100"
            >
              + ফন্ট
            </button>
          </div>

          {/* ── Size / weight / style / align ── */}
          <Slider
            label="ফন্ট সাইজ"
            min={12}
            max={300}
            value={Math.round(Number(tb.fontSize) || 64)}
            onChange={(v) => apply({ fontSize: v })}
          />

          <div className="flex items-center gap-1.5 py-1">
            <ToggleBtn
              active={String(tb.fontWeight) === "700" || tb.fontWeight === "bold"}
              onClick={() =>
                apply({ fontWeight: String(tb.fontWeight) === "700" || tb.fontWeight === "bold" ? "normal" : "700" })
              }
              label="বোল্ড"
            >
              <span className="font-extrabold">B</span>
            </ToggleBtn>
            <ToggleBtn
              active={tb.fontStyle === "italic"}
              onClick={() => apply({ fontStyle: tb.fontStyle === "italic" ? "normal" : "italic" })}
              label="ইটালিক"
            >
              <span className="italic">I</span>
            </ToggleBtn>
            <span className="mx-1 h-6 w-px bg-zinc-200" />
            {(["left", "center", "right"] as const).map((a) => (
              <ToggleBtn key={a} active={tb.textAlign === a} onClick={() => apply({ textAlign: a }, false)} label={a}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {a === "left" && <path d="M3 6h18M3 12h10M3 18h14" />}
                  {a === "center" && <path d="M3 6h18M7 12h10M5 18h14" />}
                  {a === "right" && <path d="M3 6h18M11 12h10M7 18h14" />}
                </svg>
              </ToggleBtn>
            ))}
          </div>

          {/* ── Color ── */}
          <ColorPicker
            label={range ? `রং — ${range.label}` : "টেক্সটের রং"}
            value={String(tb.fill ?? "#ffffff")}
            onChange={(c) => apply({ fill: c })}
          />

          {/* ── Spacing & opacity ── */}
          <Slider
            label="লাইন স্পেসিং"
            min={0.8}
            max={3}
            step={0.05}
            value={Number(tb.lineHeight) || 1.25}
            format={(v) => v.toFixed(2)}
            onChange={(v) => apply({ lineHeight: v }, false)}
          />
          <Slider
            label="লেটার স্পেসিং"
            min={-100}
            max={800}
            step={10}
            value={Number(tb.charSpacing) || 0}
            onChange={(v) => apply({ charSpacing: v }, false)}
          />
          <Slider
            label="অপাসিটি"
            min={0}
            max={1}
            step={0.05}
            value={tb.opacity ?? 1}
            format={(v) => `${Math.round(v * 100)}%`}
            onChange={(v) => apply({ opacity: v }, false)}
          />

          {/* ── Stroke / outline ── */}
          <Slider
            label="আউটলাইন (স্ট্রোক)"
            min={0}
            max={20}
            value={Number(tb.strokeWidth) || 0}
            onChange={(v) => apply({ strokeWidth: v })}
          />
          {Number(tb.strokeWidth) > 0 && (
            <ColorPicker
              label="আউটলাইনের রং"
              value={String(tb.stroke ?? "#000000")}
              onChange={(c) => apply({ stroke: c })}
            />
          )}

          {/* ── Shadow ── */}
          <label className="flex items-center justify-between py-2">
            <span className="text-xs font-medium text-zinc-600">টেক্সট শ্যাডো</span>
            <input
              type="checkbox"
              checked={!!shadow}
              onChange={(e) => setShadow(e.target.checked ? {} : null)}
              className="h-5 w-5 accent-indigo-600"
            />
          </label>
          {shadow && (
            <div className="rounded-lg bg-zinc-50 px-3 py-1">
              <Slider label="ব্লার" min={0} max={60} value={shadow.blur ?? 10} onChange={(v) => setShadow({ blur: v })} />
              <Slider label="X অফসেট" min={-40} max={40} value={shadow.offsetX ?? 0} onChange={(v) => setShadow({ offsetX: v })} />
              <Slider label="Y অফসেট" min={-40} max={40} value={shadow.offsetY ?? 4} onChange={(v) => setShadow({ offsetY: v })} />
              <ColorPicker label="শ্যাডোর রং" value={String(shadow.color ?? "#000000")} onChange={(c) => setShadow({ color: c })} />
            </div>
          )}
        </div>
      )}
    </BottomSheet>
  );
}

function ScopeChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
        active ? "bg-indigo-600 text-white" : "border border-zinc-200 bg-white text-zinc-600"
      }`}
    >
      {label}
    </button>
  );
}

function ToggleBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm ${
        active ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-zinc-200 text-zinc-600"
      }`}
    >
      {children}
    </button>
  );
}
