import { NextRequest, NextResponse } from "next/server";
import { getRepo } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

/** GET /api/designs/:id — full design including canvas JSON */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const repo = await getRepo();
    const design = await repo.getDesign(id);
    if (!design) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(design);
  } catch (e) {
    console.error("GET /api/designs/[id] failed:", e);
    return NextResponse.json({ error: "Failed to load design" }, { status: 500 });
  }
}

/** PUT /api/designs/:id — update (used by auto-save) */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const repo = await getRepo();
    const design = await repo.updateDesign(id, body);
    if (!design) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(design);
  } catch (e) {
    console.error("PUT /api/designs/[id] failed:", e);
    return NextResponse.json({ error: "Failed to save design" }, { status: 500 });
  }
}

/** DELETE /api/designs/:id */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const repo = await getRepo();
    const ok = await repo.deleteDesign(id);
    return NextResponse.json({ ok });
  } catch (e) {
    console.error("DELETE /api/designs/[id] failed:", e);
    return NextResponse.json({ error: "Failed to delete design" }, { status: 500 });
  }
}
