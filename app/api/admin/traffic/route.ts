import { NextResponse } from "next/server"
import { getTrafficSnapshot } from "@/lib/traffic"

export async function GET() {
  return NextResponse.json(getTrafficSnapshot())
}
