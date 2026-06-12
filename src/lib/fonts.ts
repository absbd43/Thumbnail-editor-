/**
 * Bengali font registry.
 *
 * Three sources:
 *  1. Google Fonts        — loaded via <link> in the root layout
 *  2. Bundled local TTFs  — /public/fonts/*.ttf via @font-face in globals.css
 *  3. Custom user fonts   — uploaded TTF/OTF stored in IndexedDB, loaded with the FontFace API
 */

export interface FontDef {
  /** CSS font-family name used on the canvas */
  family: string;
  /** Label shown in the font picker */
  label: string;
  source: "google" | "local" | "custom";
}

export const BUILTIN_FONTS: FontDef[] = [
  // Google Fonts (preloaded)
  { family: "Hind Siliguri", label: "হিন্দ শিলিগুড়ি", source: "google" },
  { family: "Noto Serif Bengali", label: "নোটো সেরিফ বাংলা", source: "google" },
  { family: "Baloo Da 2", label: "বালু দা ২", source: "google" },
  { family: "Tiro Bangla", label: "তিরো বাংলা", source: "google" },
  { family: "Anek Bangla", label: "অনেক বাংলা", source: "google" },
  { family: "Atma", label: "আত্মা", source: "google" },
  { family: "Galada", label: "গালাডা", source: "google" },
  { family: "Mina", label: "মিনা", source: "google" },
  // Bundled classics (public/fonts/*.ttf)
  { family: "Kalpurush", label: "কালপুরুষ", source: "local" },
  { family: "SolaimanLipi", label: "সোলায়মান লিপি", source: "local" },
  { family: "Siyam Rupali", label: "সিয়াম রূপালী", source: "local" },
  { family: "AdorshoLipi", label: "আদর্শলিপি", source: "local" },
];

/** Sample text rendered in font pickers. */
export const FONT_PREVIEW_TEXT = "বাংলা লেখা";

/**
 * Waits until the given font families are available so Fabric measures
 * Bengali glyphs correctly (wrong metrics = clipped conjuncts).
 */
export async function ensureFontsLoaded(families: string[]): Promise<void> {
  if (typeof document === "undefined") return;
  await Promise.all(
    families.flatMap((f) => [
      document.fonts.load(`400 32px "${f}"`, FONT_PREVIEW_TEXT),
      document.fonts.load(`700 32px "${f}"`, FONT_PREVIEW_TEXT),
    ])
  ).catch(() => {
    /* missing weights are fine — the browser falls back */
  });
}

/** Preload every built-in font once at editor startup. */
export async function preloadBuiltinFonts(): Promise<void> {
  await ensureFontsLoaded(BUILTIN_FONTS.map((f) => f.family));
}
