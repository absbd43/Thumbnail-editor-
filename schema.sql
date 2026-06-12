-- ============================================================
-- Bangla Thumbnail Editor — MySQL schema
-- Import this file in Hostinger hPanel → phpMyAdmin → Import
-- ============================================================

CREATE TABLE IF NOT EXISTS designs (
  id          VARCHAR(36)  NOT NULL,
  name        VARCHAR(255) NOT NULL DEFAULT 'Untitled Design',
  width       INT          NOT NULL DEFAULT 1080,
  height      INT          NOT NULL DEFAULT 1080,
  -- Full Fabric.js canvas JSON (objects, background, styles)
  data        LONGTEXT     NOT NULL,
  -- Small base64 PNG preview shown on the dashboard
  thumbnail   LONGTEXT     NULL,
  is_draft    TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_designs_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS logos (
  id          VARCHAR(36)  NOT NULL,
  name        VARCHAR(255) NOT NULL,
  -- base64 data URL of the logo image (PNG/JPG/SVG/WebP)
  data        LONGTEXT     NOT NULL,
  is_default  TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Single-row table holding the user's brand defaults
CREATE TABLE IF NOT EXISTS brand_settings (
  id                 INT          NOT NULL DEFAULT 1,
  default_font       VARCHAR(120) NOT NULL DEFAULT 'Hind Siliguri',
  default_font_size  INT          NOT NULL DEFAULT 64,
  default_text_color VARCHAR(32)  NOT NULL DEFAULT '#ffffff',
  default_logo_id    VARCHAR(36)  NULL,
  watermark_text     VARCHAR(255) NOT NULL DEFAULT '',
  canvas_width       INT          NOT NULL DEFAULT 1080,
  canvas_height      INT          NOT NULL DEFAULT 1080,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO brand_settings (id) VALUES (1);
