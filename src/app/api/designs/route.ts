import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getRepo } from "@/lib/db";

/** GET /api/designs — list all designs (without heavy canvas JSON) */
export async function GET() {
  try {
    const repo = await getRepo();
    return NextResponse.json(await repo.listDesigns());
  } catch (e) {
    console.error("GET /api/designs failed:", e);
    return NextResponse.json({ error: "Failed to load designs" }, { status: 500 });
  }
}

/** POST /api/designs — create a new design */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const repo = await getRepo();
    const design = await repo.createDesign({
      id: randomUUID(),
      name: body.name || "Untitled Design",
      width: Number(body.width) || 1080,
      height: Number(body.height) || 1080,
      data: body.data || "{}",
      thumbnail: body.thumbnail ?? null,
      isDraft: body.isDraft ?? true,
    });
    return NextResponse.json(design, { status: 201 });
  } catch (e) {
    console.error("POST /api/designs failed:", e);
    return NextResponse.json({ error: "Failed to create design" }, { status: 500 });
  }
}
