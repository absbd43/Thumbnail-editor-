/**
 * Glassmorphism background generator.
 *
 * Renders soft colorful "blurred blob" backgrounds with a frosted glass
 * card in the middle — generated on a plain <canvas> at the design's exact
 * resolution, so no image assets are needed and it stays sharp at any size.
 * The blobs are radial gradients (not ctx.filter), so it works on every browser.
 */

export interface GlassPreset {
  id: string;
  name: string;
  /** Base linear gradient (top-left → bottom-right). */
  base: [string, string];
  /** Blobs in fractional coords; r is a fraction of canvas width. */
  blobs: { x: number; y: number; r: number; color: string }[];
  /** Frosted card config; null = blobs only. */
  card: { fill: number; stroke: number } | null;
  /** CSS background used for the small preview button. */
  previewCss: string;
}

export const GLASS_PRESETS: GlassPreset[] = [
  {
    id: "glass-pastel",
    name: "গ্লাস পেস্টেল",
    base: ["#fdf2f8", "#e0e7ff"],
    blobs: [
      { x: 0.15, y: 0.12, r: 0.38, color: "rgba(244,114,182,0.55)" },
      { x: 0.88, y: 0.25, r: 0.34, color: "rgba(129,140,248,0.5)" },
      { x: 0.25, y: 0.92, r: 0.42, color: "rgba(45,212,191,0.4)" },
      { x: 0.8, y: 0.85, r: 0.3, color: "rgba(251,191,36,0.4)" },
    ],
    card: { fill: 0.3, stroke: 0.65 },
    previewCss:
      "radial-gradient(circle at 15% 12%, rgba(244,114,182,.55), transparent 45%)," +
      "radial-gradient(circle at 88% 25%, rgba(129,140,248,.5), transparent 40%)," +
      "radial-gradient(circle at 25% 92%, rgba(45,212,191,.4), transparent 48%)," +
      "linear-gradient(135deg, #fdf2f8, #e0e7ff)",
  },
  {
    id: "glass-night",
    name: "গ্লাস নাইট",
    base: ["#0f172a", "#1e1b4b"],
    blobs: [
      { x: 0.2, y: 0.18, r: 0.36, color: "rgba(34,211,238,0.4)" },
      { x: 0.85, y: 0.3, r: 0.34, color: "rgba(167,139,250,0.45)" },
      { x: 0.7, y: 0.95, r: 0.4, color: "rgba(236,72,153,0.35)" },
    ],
    card: { fill: 0.1, stroke: 0.35 },
    previewCss:
      "radial-gradient(circle at 20% 18%, rgba(34,211,238,.4), transparent 42%)," +
      "radial-gradient(circle at 85% 30%, rgba(167,139,250,.45), transparent 40%)," +
      "radial-gradient(circle at 70% 95%, rgba(236,72,153,.35), transparent 46%)," +
      "linear-gradient(135deg, #0f172a, #1e1b4b)",
  },
  {
    id: "glass-mint",
    name: "গ্লাস মিন্ট",
    base: ["#ecfdf5", "#cffafe"],
    blobs: [
      { x: 0.12, y: 0.2, r: 0.36, color: "rgba(52,211,153,0.5)" },
      { x: 0.9, y: 0.15, r: 0.3, color: "rgba(56,189,248,0.45)" },
      { x: 0.6, y: 0.95, r: 0.44, color: "rgba(163,230,53,0.35)" },
    ],
    card: { fill: 0.32, stroke: 0.7 },
    previewCss:
      "radial-gradient(circle at 12% 20%, rgba(52,211,153,.5), transparent 42%)," +
      "radial-gradient(circle at 90% 15%, rgba(56,189,248,.45), transparent 38%)," +
      "radial-gradient(circle at 60% 95%, rgba(163,230,53,.35), transparent 48%)," +
      "linear-gradient(135deg, #ecfdf5, #cffafe)",
  },
];

/** Frosted-glass card geometry, shared by presets and photo overlays. */
function cardRect(w: number, h: number) {
  return { gx: w * 0.08, gy: h * 0.24, gw: w * 0.84, gh: h * 0.52, radius: w * 0.045 };
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  gx: number,
  gy: number,
  gw: number,
  gh: number,
  radius: number
): void {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(gx, gy, gw, gh, radius);
  } else {
    // Older browsers without roundRect
    ctx.moveTo(gx + radius, gy);
    ctx.arcTo(gx + gw, gy, gx + gw, gy + gh, radius);
    ctx.arcTo(gx + gw, gy + gh, gx, gy + gh, radius);
    ctx.arcTo(gx, gy + gh, gx, gy, radius);
    ctx.arcTo(gx, gy, gx + gw, gy, radius);
    ctx.closePath();
  }
}

/** Renders a glass preset to a PNG data URL at the given canvas size. */
export function renderGlassBackground(preset: GlassPreset, w: number, h: number): string {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;

  // Base gradient
  const lg = ctx.createLinearGradient(0, 0, w, h);
  lg.addColorStop(0, preset.base[0]);
  lg.addColorStop(1, preset.base[1]);
  ctx.fillStyle = lg;
  ctx.fillRect(0, 0, w, h);

  // Soft blobs (radial gradient → transparent reads as a heavy blur)
  for (const b of preset.blobs) {
    const r = b.r * w;
    const rg = ctx.createRadialGradient(b.x * w, b.y * h, 0, b.x * w, b.y * h, r);
    rg.addColorStop(0, b.color);
    rg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, w, h);
  }

  // Frosted glass card in the text area
  if (preset.card) {
    const { gx, gy, gw, gh, radius } = cardRect(w, h);
    roundRectPath(ctx, gx, gy, gw, gh, radius);
    ctx.fillStyle = `rgba(255,255,255,${preset.card.fill * 0.55})`;
    ctx.fill();
    // Subtle top-light sheen
    const sheen = ctx.createLinearGradient(gx, gy, gx, gy + gh);
    sheen.addColorStop(0, `rgba(255,255,255,${preset.card.fill * 0.6})`);
    sheen.addColorStop(0.5, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.fill();
    ctx.lineWidth = Math.max(2, w * 0.0035);
    ctx.strokeStyle = `rgba(255,255,255,${preset.card.stroke})`;
    ctx.stroke();
  }

  return c.toDataURL("image/png");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}

/**
 * Bakes a frosted glass card on top of a photo: the card area shows the
 * photo blurred (two-pass downscale — works on every browser, no ctx.filter)
 * with a light or dark tint, sheen and border. Returns a JPEG data URL
 * (photos compress far better as JPEG, keeping auto-save payloads small).
 */
export async function applyGlassOverlayToImage(
  src: string,
  w: number,
  h: number,
  variant: "light" | "dark"
): Promise<string> {
  const img = await loadImage(src);

  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;

  // Cover-fit the photo (same math as setImageBackground)
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);

  // Strong soft blur: downscale twice, then scale back up smoothed
  const down = (source: HTMLCanvasElement, factor: number) => {
    const s = document.createElement("canvas");
    s.width = Math.max(1, Math.round(w / factor));
    s.height = Math.max(1, Math.round(h / factor));
    const sctx = s.getContext("2d")!;
    sctx.imageSmoothingEnabled = true;
    sctx.drawImage(source, 0, 0, s.width, s.height);
    return s;
  };
  const blurred = down(down(c, 12), 30);

  const { gx, gy, gw, gh, radius } = cardRect(w, h);

  ctx.save();
  roundRectPath(ctx, gx, gy, gw, gh, radius);
  ctx.clip();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(blurred, 0, 0, blurred.width, blurred.height, 0, 0, w, h);

  // Tint + top sheen inside the card
  ctx.fillStyle = variant === "light" ? "rgba(255,255,255,0.32)" : "rgba(10,15,30,0.42)";
  ctx.fillRect(gx, gy, gw, gh);
  const sheen = ctx.createLinearGradient(gx, gy, gx, gy + gh);
  sheen.addColorStop(0, variant === "light" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)");
  sheen.addColorStop(0.5, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(gx, gy, gw, gh);
  ctx.restore();

  // Border on top of everything
  roundRectPath(ctx, gx, gy, gw, gh, radius);
  ctx.lineWidth = Math.max(2, w * 0.0035);
  ctx.strokeStyle = variant === "light" ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.4)";
  ctx.stroke();

  return c.toDataURL("image/jpeg", 0.92);
}
