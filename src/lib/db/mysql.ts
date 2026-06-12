import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";
import type { Repository } from "./index";
import type { BrandSettings, DesignRecord, DesignSummary, LogoRecord } from "@/types";
import { DEFAULT_BRAND_SETTINGS } from "@/types";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || "localhost",
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 5,
      charset: "utf8mb4",
    });
  }
  return pool;
}

interface DesignRow extends RowDataPacket {
  id: string;
  name: string;
  width: number;
  height: number;
  data: string;
  thumbnail: string | null;
  is_draft: number;
  created_at: Date;
  updated_at: Date;
}

interface LogoRow extends RowDataPacket {
  id: string;
  name: string;
  data: string;
  is_default: number;
  created_at: Date;
}

interface BrandRow extends RowDataPacket {
  default_font: string;
  default_font_size: number;
  default_text_color: string;
  default_logo_id: string | null;
  watermark_text: string;
  canvas_width: number;
  canvas_height: number;
}

const toDesign = (r: DesignRow): DesignRecord => ({
  id: r.id,
  name: r.name,
  width: r.width,
  height: r.height,
  data: r.data,
  thumbnail: r.thumbnail,
  isDraft: !!r.is_draft,
  createdAt: r.created_at.toISOString(),
  updatedAt: r.updated_at.toISOString(),
});

const toLogo = (r: LogoRow): LogoRecord => ({
  id: r.id,
  name: r.name,
  data: r.data,
  isDefault: !!r.is_default,
  createdAt: r.created_at.toISOString(),
});

export function createMysqlRepo(): Repository {
  const db = getPool();

  return {
    async listDesigns(): Promise<DesignSummary[]> {
      const [rows] = await db.query<DesignRow[]>(
        "SELECT id, name, width, height, '' AS data, thumbnail, is_draft, created_at, updated_at FROM designs ORDER BY updated_at DESC"
      );
      return rows.map((r) => {
        const { data: _data, ...rest } = toDesign(r);
        return rest;
      });
    },

    async getDesign(id) {
      const [rows] = await db.query<DesignRow[]>("SELECT * FROM designs WHERE id = ?", [id]);
      return rows[0] ? toDesign(rows[0]) : null;
    },

    async createDesign(d) {
      await db.query(
        "INSERT INTO designs (id, name, width, height, data, thumbnail, is_draft) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [d.id, d.name, d.width, d.height, d.data, d.thumbnail ?? null, d.isDraft === false ? 0 : 1]
      );
      return (await this.getDesign(d.id))!;
    },

    async updateDesign(id, patch) {
      const fields: string[] = [];
      const values: unknown[] = [];
      if (patch.name !== undefined) { fields.push("name = ?"); values.push(patch.name); }
      if (patch.data !== undefined) { fields.push("data = ?"); values.push(patch.data); }
      if (patch.thumbnail !== undefined) { fields.push("thumbnail = ?"); values.push(patch.thumbnail); }
      if (patch.isDraft !== undefined) { fields.push("is_draft = ?"); values.push(patch.isDraft ? 1 : 0); }
      if (patch.width !== undefined) { fields.push("width = ?"); values.push(patch.width); }
      if (patch.height !== undefined) { fields.push("height = ?"); values.push(patch.height); }
      if (fields.length) {
        values.push(id);
        await db.query(`UPDATE designs SET ${fields.join(", ")} WHERE id = ?`, values);
      }
      return this.getDesign(id);
    },

    async deleteDesign(id) {
      const [res] = await db.query("DELETE FROM designs WHERE id = ?", [id]);
      return (res as { affectedRows: number }).affectedRows > 0;
    },

    async listLogos() {
      const [rows] = await db.query<LogoRow[]>("SELECT * FROM logos ORDER BY created_at DESC");
      return rows.map(toLogo);
    },

    async createLogo(l) {
      await db.query("INSERT INTO logos (id, name, data) VALUES (?, ?, ?)", [l.id, l.name, l.data]);
      const [rows] = await db.query<LogoRow[]>("SELECT * FROM logos WHERE id = ?", [l.id]);
      return toLogo(rows[0]);
    },

    async updateLogo(id, patch) {
      if (patch.isDefault) {
        // Only one default logo at a time
        await db.query("UPDATE logos SET is_default = 0");
      }
      const fields: string[] = [];
      const values: unknown[] = [];
      if (patch.name !== undefined) { fields.push("name = ?"); values.push(patch.name); }
      if (patch.isDefault !== undefined) { fields.push("is_default = ?"); values.push(patch.isDefault ? 1 : 0); }
      if (fields.length) {
        values.push(id);
        await db.query(`UPDATE logos SET ${fields.join(", ")} WHERE id = ?`, values);
      }
      const [rows] = await db.query<LogoRow[]>("SELECT * FROM logos WHERE id = ?", [id]);
      return rows[0] ? toLogo(rows[0]) : null;
    },

    async deleteLogo(id) {
      const [res] = await db.query("DELETE FROM logos WHERE id = ?", [id]);
      return (res as { affectedRows: number }).affectedRows > 0;
    },

    async getBrandSettings() {
      const [rows] = await db.query<BrandRow[]>("SELECT * FROM brand_settings WHERE id = 1");
      const r = rows[0];
      if (!r) return { ...DEFAULT_BRAND_SETTINGS };
      return {
        defaultFont: r.default_font,
        defaultFontSize: r.default_font_size,
        defaultTextColor: r.default_text_color,
        defaultLogoId: r.default_logo_id,
        watermarkText: r.watermark_text,
        canvasWidth: r.canvas_width,
        canvasHeight: r.canvas_height,
      };
    },

    async saveBrandSettings(s) {
      await db.query(
        `INSERT INTO brand_settings (id, default_font, default_font_size, default_text_color, default_logo_id, watermark_text, canvas_width, canvas_height)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE default_font = VALUES(default_font), default_font_size = VALUES(default_font_size),
           default_text_color = VALUES(default_text_color), default_logo_id = VALUES(default_logo_id),
           watermark_text = VALUES(watermark_text), canvas_width = VALUES(canvas_width), canvas_height = VALUES(canvas_height)`,
        [s.defaultFont, s.defaultFontSize, s.defaultTextColor, s.defaultLogoId, s.watermarkText, s.canvasWidth, s.canvasHeight]
      );
      return s;
    },
  };
}
