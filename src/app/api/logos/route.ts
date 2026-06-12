import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getRepo } from "@/lib/db";

/** GET /api/logos — list saved logos */
export async function GET() {
  try {
    const repo = await getRepo();
    return NextResponse.json(await repo.listLogos());
  } catch (e) {
    console.error("GET /api/logos failed:", e);
    return NextResponse.json({ error: "Failed to load logos" }, { status: 500 });
  }
}

/** POST /api/logos — upload a logo (base64 data URL in body.data) */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.data || typeof body.data !== "string") {
      return NextResponse.json({ error: "Missing logo data" }, { status: 400 });
    }
    const repo = await getRepo();
    const logo = await repo.createLogo({
      id: randomUUID(),
      name: body.name || "My Logo",
      data: body.data,
    });
    return NextResponse.json(logo, { status: 201 });
  } catch (e) {
    console.error("POST /api/logos failed:", e);
    return NextResponse.json({ error: "Failed to upload logo" }, { status: 500 });
  }
}
