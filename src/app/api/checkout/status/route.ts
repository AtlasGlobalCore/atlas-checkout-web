// ─── Payment Status Polling API ─────────────────────────────────────────────
// GET /api/checkout/status?sessionId=xxx

import { NextResponse } from "next/server";
import type { PaymentStatusResponse } from "@/lib/checkout/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  // In production: query Atlas Core for real-time payment status
  const response: PaymentStatusResponse = {
    sessionId,
    status: "pending",
  };

  return NextResponse.json(response);
}
