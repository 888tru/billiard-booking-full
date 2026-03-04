import { NextResponse } from "next/server";
import { getTables } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(getTables());
}

