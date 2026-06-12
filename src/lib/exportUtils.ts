import type { Canvas } from "fabric";
import type { ExportOptions } from "@/types";

/** Export size presets (base width in px for a 1080-wide design). */
export const EXPORT_SIZES = [
  { px: 1080, label: "স্ট্যান্ডার্ড", sub: "1080px" },
  { px: 2160, label: "HD", sub: "2160px" },
  { px: 3240, label: "আল্ট্রা HD", sub: "3240px" },
  { px: 4320, label: "প্রিন্ট কোয়ালিটি", sub: "4320px · 300 DPI" },
] as const;

/**
 * High-resolution export.
 *
 * Fabric re-renders the whole scene at `multiplier` scale, so text is
 * re-rasterized from vector glyph outlines — Bengali stays perfectly sharp
 * at 4320px (300 DPI for a 14.4" print) with no upscaling blur.
 */
export async function exportCanvas(canvas: Canvas, opts: ExportOptions): Promise<void> {
  canvas.discardActiveObject();
  canvas.renderAll();

  const multiplier = opts.size / canvas.getWidth();

  // Transparent PNG: temporarily strip the background, then restore it
  const prevColor = canvas.backgroundColor;
  const prevImage = canvas.backgroundImage;
  if (opts.transparent) {
    canvas.backgroundColor = "";
    canvas.backgroundImage = undefined;
    canvas.renderAll();
  }

  try {
    const dataUrl = canvas.toDataURL({
      format: opts.format,
      quality: opts.quality,
      multiplier,
      enableRetinaScaling: false,
    });
    const ext = opts.format === "jpeg" ? "jpg" : "png";
    const w = Math.round(canvas.getWidth() * multiplier);
    const h = Math.round(canvas.getHeight() * multiplier);
    await downloadDataURL(dataUrl, `thumbnail-${w}x${h}.${ext}`);
  } finally {
    if (opts.transparent) {
      canvas.backgroundColor = prevColor;
      canvas.backgroundImage = prevImage;
      canvas.renderAll();
    }
  }
}

/** Convert a data URL to a Blob download (reliable on mobile browsers). */
async function downloadDataURL(dataUrl: string, filename: string): Promise<void> {
  const blob = await (await fetch(dataUrl)).blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give the browser a moment before revoking
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
