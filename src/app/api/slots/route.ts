import { NextRequest, NextResponse } from "next/server";
import { getSlots } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tableId = searchParams.get("table_id");
  const date = searchParams.get("date");
  if (!tableId || !date) return NextResponse.json({ error: "table_id and date required" }, { status: 400 });
  await new Promise(r => setTimeout(r, 200));
  return NextResponse.json(getSlots(tableId, date));
}

