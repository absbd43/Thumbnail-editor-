import { promises as fs } from "fs";
import path from "path";
import type { Repository } from "./index";
import type { BrandSettings, DesignRecord, LogoRecord } from "@/types";
import { DEFAULT_BRAND_SETTINGS } from "@/types";

/**
 * JSON-file storage used when MySQL is not configured.
 * Lets the app run locally (`npm run dev`) with zero setup.
 */

const DATA_DIR = path.join(process.cwd(), "data");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(value), "utf8");
}

export function createFileRepo(): Repository {
  return {
    async listDesigns() {
      const designs = await readJson<DesignRecord[]>("designs.json", []);
      return designs
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map(({ data: _data, ...rest }) => rest);
    },

    async getDesign(id) {
      const designs = await readJson<DesignRecord[]>("designs.json", []);
      return designs.find((d) => d.id === id) ?? null;
    },

    async createDesign(d) {
      const designs = await readJson<DesignRecord[]>("designs.json", []);
      const now = new Date().toISOString();
      const record: DesignRecord = {
        id: d.id,
        name: d.name,
        width: d.width,
        height: d.height,
        data: d.data,
        thumbnail: d.thumbnail ?? null,
        isDraft: d.isDraft ?? true,
        createdAt: now,
        updatedAt: now,
      };
      designs.push(record);
      await writeJson("designs.json", designs);
      return record;
    },

    async updateDesign(id, patch) {
      const designs = await readJson<DesignRecord[]>("designs.json", []);
      const idx = designs.findIndex((d) => d.id === id);
      if (idx === -1) return null;
      designs[idx] = { ...designs[idx], ...patch, updatedAt: new Date().toISOString() };
      await writeJson("designs.json", designs);
      return designs[idx];
    },

    async deleteDesign(id) {
      const designs = await readJson<DesignRecord[]>("designs.json", []);
      const next = designs.filter((d) => d.id !== id);
      await writeJson("designs.json", next);
      return next.length !== designs.length;
    },

    async listLogos() {
      const logos = await readJson<LogoRecord[]>("logos.json", []);
      return logos.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    async createLogo(l) {
      const logos = await readJson<LogoRecord[]>("logos.json", []);
      const record: LogoRecord = { ...l, isDefault: false, createdAt: new Date().toISOString() };
      logos.push(record);
      await writeJson("logos.json", logos);
      return record;
    },

    async updateLogo(id, patch) {
      const logos = await readJson<LogoRecord[]>("logos.json", []);
      const idx = logos.findIndex((l) => l.id === id);
      if (idx === -1) return null;
      if (patch.isDefault) logos.forEach((l) => (l.isDefault = false));
      logos[idx] = { ...logos[idx], ...patch };
      await writeJson("logos.json", logos);
      return logos[idx];
    },

    async deleteLogo(id) {
      const logos = await readJson<LogoRecord[]>("logos.json", []);
      const next = logos.filter((l) => l.id !== id);
      await writeJson("logos.json", next);
      return next.length !== logos.length;
    },

    async getBrandSettings() {
      return readJson<BrandSettings>("brand.json", { ...DEFAULT_BRAND_SETTINGS });
    },

    async saveBrandSettings(s) {
      await writeJson("brand.json", s);
      return s;
    },
  };
}
