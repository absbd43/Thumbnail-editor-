/** A saved design / draft. `data` holds the full Fabric.js canvas JSON. */
export interface DesignRecord {
  id: string;
  name: string;
  width: number;
  height: number;
  data: string;
  thumbnail: string | null;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Summary used in list views (omits the heavy canvas JSON). */
export type DesignSummary = Omit<DesignRecord, "data">;

/** A logo stored in "My Logos" (base64 data URL). */
export interface LogoRecord {
  id: string;
  name: string;
  data: string;
  isDefault: boolean;
  createdAt: string;
}

/** User brand defaults, applied automatically to new projects. */
export interface BrandSettings {
  defaultFont: string;
  defaultFontSize: number;
  defaultTextColor: string;
  defaultLogoId: string | null;
  watermarkText: string;
  canvasWidth: number;
  canvasHeight: number;
}

export const DEFAULT_BRAND_SETTINGS: BrandSettings = {
  defaultFont: "Hind Siliguri",
  defaultFontSize: 64,
  defaultTextColor: "#ffffff",
  defaultLogoId: null,
  watermarkText: "",
  canvasWidth: 1080,
  canvasHeight: 1080,
};

export type TemplateCategory =
  | "islamic"
  | "marriage"
  | "motivational"
  | "fb-status"
  | "social"
  | "business";

/** Word → color map for word-level styling inside a single text block. */
export type WordColorMap = Record<string, string>;

export interface TemplateText {
  text: string;
  /** Vertical center position as a fraction of canvas height (0–1). */
  top: number;
  fontFamily: string;
  /** Font size as a fraction of canvas width, so templates scale to any size. */
  fontSize: number;
  fill: string;
  fontWeight?: string | number;
  textAlign?: "left" | "center" | "right";
  /** Width as fraction of canvas width. Default 0.86 */
  width?: number;
  lineHeight?: number;
  shadow?: boolean;
  wordColors?: WordColorMap;
}

export interface TemplateSpec {
  id: string;
  name: string;
  category: TemplateCategory;
  background:
    | { type: "solid"; color: string }
    | { type: "gradient"; colors: [string, string]; angle?: number };
  texts: TemplateText[];
}

/** Export configuration for the high-resolution renderer. */
export interface ExportOptions {
  format: "png" | "jpeg";
  /** Output size in px (square designs) or multiplier base — 1080/2160/3240/4320 */
  size: number;
  transparent: boolean;
  /** JPEG quality 0–1 */
  quality: number;
}
