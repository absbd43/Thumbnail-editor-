import { Canvas, Shadow, Textbox } from "fabric";
import type { TemplateCategory, TemplateSpec } from "@/types";
import {
  buildWordStyles,
  setGradientBackground,
  setSolidBackground,
  uid,
  type EditorObject,
} from "./fabricHelpers";

export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string }[] = [
  { id: "islamic", label: "ইসলামিক" },
  { id: "marriage", label: "বিবাহ" },
  { id: "motivational", label: "মোটিভেশনাল" },
  { id: "fb-status", label: "ফেসবুক স্ট্যাটাস" },
  { id: "social", label: "সোশ্যাল মিডিয়া" },
  { id: "business", label: "বিজনেস" },
];

/**
 * Template definitions. Positions/sizes are fractions of canvas size,
 * so every template works on any canvas dimension.
 */
export const TEMPLATES: TemplateSpec[] = [
  // ── Islamic ──
  {
    id: "islamic-bismillah",
    name: "বিসমিল্লাহ",
    category: "islamic",
    background: { type: "gradient", colors: ["#064e3b", "#10b981"], angle: 135 },
    texts: [
      { text: "﷽", top: 0.22, fontFamily: "Noto Serif Bengali", fontSize: 0.1, fill: "#fcd34d" },
      { text: "বিসমিল্লাহির রাহমানির রাহিম", top: 0.45, fontFamily: "Noto Serif Bengali", fontSize: 0.062, fill: "#ffffff", fontWeight: 700, shadow: true },
      { text: "পরম করুণাময় ও অসীম দয়ালু\nআল্লাহর নামে শুরু করছি", top: 0.65, fontFamily: "Hind Siliguri", fontSize: 0.038, fill: "#d1fae5", lineHeight: 1.5 },
    ],
  },
  {
    id: "islamic-namaz",
    name: "নামাজের গুরুত্ব",
    category: "islamic",
    background: { type: "gradient", colors: ["#0f172a", "#1e3a8a"], angle: 160 },
    texts: [
      { text: "❝", top: 0.18, fontFamily: "Noto Serif Bengali", fontSize: 0.12, fill: "#fbbf24" },
      { text: "নামাজ জান্নাতের চাবি", top: 0.45, fontFamily: "Noto Serif Bengali", fontSize: 0.075, fill: "#fbbf24", fontWeight: 700, shadow: true },
      { text: "— আল হাদিস", top: 0.62, fontFamily: "Hind Siliguri", fontSize: 0.035, fill: "#e2e8f0" },
    ],
  },
  {
    id: "islamic-jumma",
    name: "জুমআ মোবারক",
    category: "islamic",
    background: { type: "gradient", colors: ["#312e81", "#7c3aed"], angle: 120 },
    texts: [
      { text: "✦ ✦ ✦", top: 0.25, fontFamily: "Hind Siliguri", fontSize: 0.04, fill: "#fde68a" },
      { text: "জুমআ মোবারক", top: 0.45, fontFamily: "Galada", fontSize: 0.095, fill: "#ffffff", shadow: true },
      { text: "আপনার জুমআ কাটুক ইবাদতে", top: 0.63, fontFamily: "Hind Siliguri", fontSize: 0.036, fill: "#ddd6fe" },
    ],
  },

  // ── Marriage ──
  {
    id: "marriage-patri",
    name: "পাত্রী চাই",
    category: "marriage",
    background: { type: "gradient", colors: ["#1e293b", "#0f172a"], angle: 90 },
    texts: [
      { text: "বিয়ের জন্য", top: 0.2, fontFamily: "Hind Siliguri", fontSize: 0.04, fill: "#94a3b8" },
      {
        text: "সিলেট বিভাগের\nদিনদার পাত্রী",
        top: 0.45,
        fontFamily: "Hind Siliguri",
        fontSize: 0.085,
        fill: "#ffffff",
        fontWeight: 700,
        lineHeight: 1.35,
        shadow: true,
        // Word-level styling: each word gets its own color
        wordColors: { "দিনদার": "#60a5fa", "পাত্রী": "#f472b6" },
      },
      { text: "আগ্রহীরা ইনবক্সে যোগাযোগ করুন", top: 0.72, fontFamily: "Hind Siliguri", fontSize: 0.036, fill: "#cbd5e1" },
    ],
  },
  {
    id: "marriage-patro",
    name: "পাত্র চাই",
    category: "marriage",
    background: { type: "gradient", colors: ["#7f1d1d", "#b45309"], angle: 135 },
    texts: [
      { text: "♥", top: 0.18, fontFamily: "Hind Siliguri", fontSize: 0.07, fill: "#fecaca" },
      {
        text: "প্রতিষ্ঠিত দ্বীনদার\nপাত্র চাই",
        top: 0.45,
        fontFamily: "Noto Serif Bengali",
        fontSize: 0.08,
        fill: "#ffffff",
        fontWeight: 700,
        lineHeight: 1.4,
        shadow: true,
        wordColors: { "পাত্র": "#fde047" },
      },
      { text: "বিস্তারিত জানতে মেসেজ করুন", top: 0.73, fontFamily: "Hind Siliguri", fontSize: 0.035, fill: "#fef3c7" },
    ],
  },

  // ── Motivational ──
  {
    id: "motiv-success",
    name: "সাফল্যের চাবিকাঠি",
    category: "motivational",
    background: { type: "gradient", colors: ["#111827", "#374151"], angle: 135 },
    texts: [
      {
        text: "পরিশ্রমই\nসাফল্যের চাবিকাঠি",
        top: 0.45,
        fontFamily: "Hind Siliguri",
        fontSize: 0.08,
        fill: "#ffffff",
        fontWeight: 700,
        lineHeight: 1.4,
        shadow: true,
        wordColors: { "সাফল্যের": "#facc15" },
      },
      { text: "আজ থেকেই শুরু করুন", top: 0.68, fontFamily: "Hind Siliguri", fontSize: 0.035, fill: "#9ca3af" },
    ],
  },
  {
    id: "motiv-never-give-up",
    name: "হাল ছেড়ো না",
    category: "motivational",
    background: { type: "gradient", colors: ["#7c2d12", "#f59e0b"], angle: 180 },
    texts: [
      {
        text: "হাল ছেড়ো না,\nলেগে থাকো",
        top: 0.42,
        fontFamily: "Atma",
        fontSize: 0.09,
        fill: "#ffffff",
        fontWeight: 700,
        lineHeight: 1.35,
        shadow: true,
      },
      { text: "সফলতা সময়ের ব্যাপার মাত্র", top: 0.66, fontFamily: "Hind Siliguri", fontSize: 0.038, fill: "#fef3c7" },
    ],
  },

  // ── Facebook status ──
  {
    id: "fb-quote-minimal",
    name: "মিনিমাল কোট",
    category: "fb-status",
    background: { type: "solid", color: "#fafaf9" },
    texts: [
      { text: "❝", top: 0.2, fontFamily: "Noto Serif Bengali", fontSize: 0.12, fill: "#d6d3d1" },
      {
        text: "জীবন সুন্দর,\nযদি দেখার চোখ থাকে",
        top: 0.48,
        fontFamily: "Noto Serif Bengali",
        fontSize: 0.065,
        fill: "#1c1917",
        lineHeight: 1.5,
      },
      { text: "— আপনার নাম", top: 0.7, fontFamily: "Hind Siliguri", fontSize: 0.032, fill: "#78716c" },
    ],
  },
  {
    id: "fb-colorful",
    name: "রঙিন স্ট্যাটাস",
    category: "fb-status",
    background: { type: "gradient", colors: ["#db2777", "#7c3aed"], angle: 45 },
    texts: [
      {
        text: "আলহামদুলিল্লাহ\nসবকিছুর জন্য",
        top: 0.48,
        fontFamily: "Baloo Da 2",
        fontSize: 0.08,
        fill: "#ffffff",
        fontWeight: 700,
        lineHeight: 1.4,
        shadow: true,
      },
    ],
  },

  // ── Social media ──
  {
    id: "social-follow",
    name: "ফলো করুন",
    category: "social",
    background: { type: "gradient", colors: ["#0ea5e9", "#2563eb"], angle: 135 },
    texts: [
      { text: "আমাদের পেজটি", top: 0.32, fontFamily: "Hind Siliguri", fontSize: 0.05, fill: "#e0f2fe" },
      { text: "ফলো করুন", top: 0.47, fontFamily: "Hind Siliguri", fontSize: 0.1, fill: "#ffffff", fontWeight: 700, shadow: true },
      { text: "নতুন পোস্টের আপডেট পেতে 🔔", top: 0.64, fontFamily: "Hind Siliguri", fontSize: 0.038, fill: "#bae6fd" },
    ],
  },
  {
    id: "social-sale",
    name: "অফার পোস্ট",
    category: "social",
    background: { type: "gradient", colors: ["#dc2626", "#f97316"], angle: 135 },
    texts: [
      { text: "বিশেষ ছাড়", top: 0.3, fontFamily: "Hind Siliguri", fontSize: 0.06, fill: "#fff7ed", fontWeight: 700 },
      { text: "৫০%", top: 0.48, fontFamily: "Baloo Da 2", fontSize: 0.18, fill: "#fde047", fontWeight: 700, shadow: true },
      { text: "সীমিত সময়ের জন্য · আজই অর্ডার করুন", top: 0.7, fontFamily: "Hind Siliguri", fontSize: 0.035, fill: "#ffedd5" },
    ],
  },

  // ── Business ──
  {
    id: "business-ad",
    name: "বিজ্ঞাপন",
    category: "business",
    background: { type: "gradient", colors: ["#134e4a", "#0f766e"], angle: 135 },
    texts: [
      { text: "আপনার ব্যবসার", top: 0.34, fontFamily: "Hind Siliguri", fontSize: 0.05, fill: "#ccfbf1" },
      { text: "বিজ্ঞাপন দিন", top: 0.48, fontFamily: "Hind Siliguri", fontSize: 0.09, fill: "#ffffff", fontWeight: 700, shadow: true },
      { text: "যোগাযোগ: ০১XXXXXXXXX", top: 0.66, fontFamily: "Hind Siliguri", fontSize: 0.036, fill: "#99f6e4" },
    ],
  },
  {
    id: "business-coming-soon",
    name: "নতুন অফার",
    category: "business",
    background: { type: "solid", color: "#09090b" },
    texts: [
      { text: "শীঘ্রই আসছে", top: 0.36, fontFamily: "Hind Siliguri", fontSize: 0.045, fill: "#a1a1aa" },
      { text: "নতুন অফার", top: 0.5, fontFamily: "Noto Serif Bengali", fontSize: 0.095, fill: "#eab308", fontWeight: 700, shadow: true },
      { text: "চোখ রাখুন আমাদের পেজে", top: 0.66, fontFamily: "Hind Siliguri", fontSize: 0.035, fill: "#71717a" },
    ],
  },
];

export function getTemplate(id: string): TemplateSpec | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

/** Replaces the canvas content with the given template. */
export function applyTemplate(canvas: Canvas, spec: TemplateSpec): void {
  canvas.remove(...canvas.getObjects());
  canvas.backgroundImage = undefined;

  if (spec.background.type === "solid") {
    setSolidBackground(canvas, spec.background.color);
  } else {
    setGradientBackground(canvas, spec.background.colors, spec.background.angle ?? 90);
  }

  const w = canvas.getWidth();
  const h = canvas.getHeight();

  for (const t of spec.texts) {
    const tb = new Textbox(t.text, {
      width: w * (t.width ?? 0.86),
      left: w / 2,
      top: h * t.top,
      originX: "center",
      originY: "center",
      fontFamily: t.fontFamily,
      fontSize: Math.round(w * t.fontSize),
      fill: t.fill,
      fontWeight: t.fontWeight ?? "normal",
      textAlign: t.textAlign ?? "center",
      lineHeight: t.lineHeight ?? 1.3,
      paintFirst: "stroke",
      strokeWidth: 0,
      stroke: "#000000",
      shadow: t.shadow
        ? new Shadow({ color: "rgba(0,0,0,0.45)", blur: Math.round(w * 0.012), offsetX: 0, offsetY: Math.round(w * 0.004) })
        : undefined,
      styles: t.wordColors ? buildWordStyles(t.text, t.wordColors) : undefined,
    });
    (tb as EditorObject).id = uid();
    (tb as EditorObject).layerName = t.text.split("\n")[0].slice(0, 18);
    canvas.add(tb);
  }
  canvas.discardActiveObject();
  canvas.requestRenderAll();
}
