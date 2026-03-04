import { NextRequest, NextResponse } from "next/server";
import { createBooking, getBookings, getBooking, updateBookingStatus } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(getBookings());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { table_id, date, start_time, duration, customer_name, phone } = body;
  if (!table_id || !date || !start_time || !duration || !customer_name || !phone) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }
  await new Promise(r => setTimeout(r, 300));
  return NextResponse.json(createBooking({ table_id, date, start_time, duration, customer_name, phone }), { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status } = body;
  if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });
  const b = updateBookingStatus(id, status);
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(b);
}

