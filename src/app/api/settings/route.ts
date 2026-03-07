import { NextResponse } from "next/server";
import { CLUB } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    booking_fee: CLUB.booking_fee,
    open_time: CLUB.open_time,
    close_time: CLUB.close_time,
  });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  if (typeof body.booking_fee === "number" && body.booking_fee >= 0) {
    CLUB.booking_fee = body.booking_fee;
  }
  return NextResponse.json({ booking_fee: CLUB.booking_fee });
}

