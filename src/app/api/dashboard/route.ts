import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/mock-data";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json(getDashboardStats()); }

