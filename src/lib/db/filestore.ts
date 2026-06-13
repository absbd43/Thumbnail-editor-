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

/**
 * Serializes every repository operation so concurrent auto-saves can't
 * interleave a read-modify-write cycle on the same JSON file. Operations
 * are short and local-dev only, so a single global lock is plenty.
 */
let lock: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = lock.then(fn, fn);
  // Keep the chain alive regardless of individual success/failure
  lock = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  let raw: string;
  try {
    raw = await fs.readFile(path.join(DATA_DIR, file), "utf8");
  } catch (e) {
    // Missing file → first run; safe to use the fallback.
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw e;
  }
  // A parse failure means the file is corrupt or was read mid-write. Throwing
  // (instead of returning []) prevents us from overwriting good data with empty.
  return JSON.parse(raw) as T;
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const target = path.join(DATA_DIR, file);
  // Atomic write: write to a temp file, then rename over the target so a
  // concurrent reader never sees a half-written file.
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value), "utf8");
  await fs.rename(tmp, target);
}

export function createFileRepo(): Repository {
  // Every method runs inside withLock() so concurrent auto-saves serialize
  // their read-modify-write cycle and can't clobber each other.
  return {
    listDesigns: () =>
      withLock(async () => {
        const designs = await readJson<DesignRecord[]>("designs.json", []);
        return designs
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
          .map(({ data: _data, ...rest }) => rest);
      }),

    getDesign: (id) =>
      withLock(async () => {
        const designs = await readJson<DesignRecord[]>("designs.json", []);
        return designs.find((d) => d.id === id) ?? null;
      }),

    createDesign: (d) =>
      withLock(async () => {
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
      }),

    updateDesign: (id, patch) =>
      withLock(async () => {
        const designs = await readJson<DesignRecord[]>("designs.json", []);
        const idx = designs.findIndex((d) => d.id === id);
        if (idx === -1) return null;
        designs[idx] = { ...designs[idx], ...patch, updatedAt: new Date().toISOString() };
        await writeJson("designs.json", designs);
        return designs[idx];
      }),

    deleteDesign: (id) =>
      withLock(async () => {
        const designs = await readJson<DesignRecord[]>("designs.json", []);
        const next = designs.filter((d) => d.id !== id);
        await writeJson("designs.json", next);
        return next.length !== designs.length;
      }),

    listLogos: () =>
      withLock(async () => {
        const logos = await readJson<LogoRecord[]>("logos.json", []);
        return logos.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }),

    createLogo: (l) =>
      withLock(async () => {
        const logos = await readJson<LogoRecord[]>("logos.json", []);
        const record: LogoRecord = { ...l, isDefault: false, createdAt: new Date().toISOString() };
        logos.push(record);
        await writeJson("logos.json", logos);
        return record;
      }),

    updateLogo: (id, patch) =>
      withLock(async () => {
        const logos = await readJson<LogoRecord[]>("logos.json", []);
        const idx = logos.findIndex((l) => l.id === id);
        if (idx === -1) return null;
        if (patch.isDefault) logos.forEach((l) => (l.isDefault = false));
        logos[idx] = { ...logos[idx], ...patch };
        await writeJson("logos.json", logos);
        return logos[idx];
      }),

    deleteLogo: (id) =>
      withLock(async () => {
        const logos = await readJson<LogoRecord[]>("logos.json", []);
        const next = logos.filter((l) => l.id !== id);
        await writeJson("logos.json", next);
        return next.length !== logos.length;
      }),

    getBrandSettings: () =>
      withLock(() => readJson<BrandSettings>("brand.json", { ...DEFAULT_BRAND_SETTINGS })),

    saveBrandSettings: (s) =>
      withLock(async () => {
        await writeJson("brand.json", s);
        return s;
      }),
  };
}
