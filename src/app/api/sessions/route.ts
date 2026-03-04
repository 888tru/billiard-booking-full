import { NextRequest, NextResponse } from "next/server";
import { createSession, getActiveSessions, getSessions, pauseSession, resumeSession, finishSession } from "@/lib/mock-data";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getSessions());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { table_id, client, mode, duration, booking_id } = body;
  if (!table_id || !client || !mode) return NextResponse.json({ error: "table_id, client, mode required" }, { status: 400 });
  const session = createSession({ table_id, client, mode, duration: duration || 0, booking_id });
  return NextResponse.json(session, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, action } = body;
  if (!id || !action) return NextResponse.json({ error: "id and action required" }, { status: 400 });
  let session;
  if (action === "pause") session = pauseSession(id);
  else if (action === "resume") session = resumeSession(id);
  else if (action === "finish") session = finishSession(id);
  if (!session) return NextResponse.json({ error: "Not found or invalid" }, { status: 404 });
  return NextResponse.json(session);
}

