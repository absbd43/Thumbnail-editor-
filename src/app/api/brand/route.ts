import { NextRequest, NextResponse } from "next/server";
import { getRepo } from "@/lib/db";
import { DEFAULT_BRAND_SETTINGS } from "@/types";

/** GET /api/brand — current brand settings */
export async function GET() {
  try {
    const repo = await getRepo();
    return NextResponse.json(await repo.getBrandSettings());
  } catch (e) {
    console.error("GET /api/brand failed:", e);
    return NextResponse.json(DEFAULT_BRAND_SETTINGS);
  }
}

/** PUT /api/brand — save brand settings */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const repo = await getRepo();
    const settings = await repo.saveBrandSettings({
      ...DEFAULT_BRAND_SETTINGS,
      ...body,
    });
    return NextResponse.json(settings);
  } catch (e) {
    console.error("PUT /api/brand failed:", e);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
