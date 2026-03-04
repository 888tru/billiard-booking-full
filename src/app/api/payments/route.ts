import { NextResponse } from "next/server";
import { confirmBooking } from "@/lib/mock-data";

export async function POST(req: Request) {
  const body = await req.json();
  const { booking_id, provider } = body;
  if (!booking_id || !provider) return NextResponse.json({ error: "booking_id and provider required" }, { status: 400 });
  await new Promise(r => setTimeout(r, 1200));
  const booking = confirmBooking(booking_id);
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  return NextResponse.json({ status: "success", booking_id, provider });
}

