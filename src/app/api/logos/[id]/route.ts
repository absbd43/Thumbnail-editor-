import { NextRequest, NextResponse } from "next/server";
import { getRepo } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

/** PUT /api/logos/:id — rename or set default */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const repo = await getRepo();
    const logo = await repo.updateLogo(id, body);
    if (!logo) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(logo);
  } catch (e) {
    console.error("PUT /api/logos/[id] failed:", e);
    return NextResponse.json({ error: "Failed to update logo" }, { status: 500 });
  }
}

/** DELETE /api/logos/:id */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const repo = await getRepo();
    const ok = await repo.deleteLogo(id);
    return NextResponse.json({ ok });
  } catch (e) {
    console.error("DELETE /api/logos/[id] failed:", e);
    return NextResponse.json({ error: "Failed to delete logo" }, { status: 500 });
  }
}
