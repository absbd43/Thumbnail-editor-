/**
 * Tiny IndexedDB helper.
 *
 * Used for:
 *  - custom uploaded fonts (TTF/OTF binaries — too large for localStorage)
 *  - offline draft backup (crash recovery before auto-save reaches the server)
 */

const DB_NAME = "bangla-thumbnail-editor";
const DB_VERSION = 1;
const FONT_STORE = "customFonts";
const BACKUP_STORE = "draftBackups";

export interface CustomFontRecord {
  family: string;
  /** Raw TTF/OTF bytes */
  data: ArrayBuffer;
  addedAt: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(FONT_STORE)) {
        db.createObjectStore(FONT_STORE, { keyPath: "family" });
      }
      if (!db.objectStoreNames.contains(BACKUP_STORE)) {
        db.createObjectStore(BACKUP_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = fn(t.objectStore(store));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      })
  );
}

// ── Custom fonts ────────────────────────────────────────────────

export async function saveCustomFont(family: string, data: ArrayBuffer): Promise<void> {
  await tx(FONT_STORE, "readwrite", (s) =>
    s.put({ family, data, addedAt: Date.now() } satisfies CustomFontRecord)
  );
}

export async function listCustomFonts(): Promise<CustomFontRecord[]> {
  return tx<CustomFontRecord[]>(FONT_STORE, "readonly", (s) => s.getAll());
}

export async function deleteCustomFont(family: string): Promise<void> {
  await tx(FONT_STORE, "readwrite", (s) => s.delete(family));
}

/** Registers a custom font with the browser so the canvas can use it. */
export async function registerFontFace(family: string, data: ArrayBuffer): Promise<void> {
  const face = new FontFace(family, data);
  await face.load();
  document.fonts.add(face);
}

/** Load every stored custom font into document.fonts. Returns family names. */
export async function loadAllCustomFonts(): Promise<string[]> {
  try {
    const fonts = await listCustomFonts();
    await Promise.all(fonts.map((f) => registerFontFace(f.family, f.data).catch(() => {})));
    return fonts.map((f) => f.family);
  } catch {
    return [];
  }
}

// ── Draft backup (crash recovery) ───────────────────────────────

export async function saveDraftBackup(id: string, json: string): Promise<void> {
  try {
    await tx(BACKUP_STORE, "readwrite", (s) => s.put({ id, json, savedAt: Date.now() }));
  } catch {
    /* backup is best-effort */
  }
}

export async function getDraftBackup(id: string): Promise<{ json: string; savedAt: number } | null> {
  try {
    return (await tx<{ id: string; json: string; savedAt: number }>(
      BACKUP_STORE,
      "readonly",
      (s) => s.get(id) as IDBRequest<{ id: string; json: string; savedAt: number }>
    )) ?? null;
  } catch {
    return null;
  }
}
