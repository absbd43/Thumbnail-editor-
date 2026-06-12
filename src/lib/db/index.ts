import type {
  BrandSettings,
  DesignRecord,
  DesignSummary,
  LogoRecord,
} from "@/types";

/**
 * Storage repository interface.
 *
 * Two implementations:
 *  - MySQL  (production on Hostinger — set MYSQL_* env vars)
 *  - File   (local development fallback — JSON files in ./data)
 */
export interface Repository {
  listDesigns(): Promise<DesignSummary[]>;
  getDesign(id: string): Promise<DesignRecord | null>;
  createDesign(
    d: Pick<DesignRecord, "id" | "name" | "width" | "height" | "data"> &
      Partial<Pick<DesignRecord, "thumbnail" | "isDraft">>
  ): Promise<DesignRecord>;
  updateDesign(
    id: string,
    patch: Partial<Pick<DesignRecord, "name" | "data" | "thumbnail" | "isDraft" | "width" | "height">>
  ): Promise<DesignRecord | null>;
  deleteDesign(id: string): Promise<boolean>;

  listLogos(): Promise<LogoRecord[]>;
  createLogo(l: Pick<LogoRecord, "id" | "name" | "data">): Promise<LogoRecord>;
  updateLogo(
    id: string,
    patch: Partial<Pick<LogoRecord, "name" | "isDefault">>
  ): Promise<LogoRecord | null>;
  deleteLogo(id: string): Promise<boolean>;

  getBrandSettings(): Promise<BrandSettings>;
  saveBrandSettings(s: BrandSettings): Promise<BrandSettings>;
}

let repo: Repository | null = null;

/** Returns the active repository, choosing MySQL when configured. */
export async function getRepo(): Promise<Repository> {
  if (repo) return repo;
  if (process.env.MYSQL_DATABASE && process.env.MYSQL_USER) {
    const { createMysqlRepo } = await import("./mysql");
    repo = createMysqlRepo();
  } else {
    const { createFileRepo } = await import("./filestore");
    repo = createFileRepo();
  }
  return repo;
}
