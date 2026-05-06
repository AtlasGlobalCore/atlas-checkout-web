// ─── CRM Registration + Payment Initiation API ───────────────────────────────
// POST /api/checkout/pay — Register payer in Mini-CRM

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, payer } = body;

    if (!sessionId || !payer?.fullName || !payer?.email) {
      return NextResponse.json(
        { error: "sessionId, payer.fullName, and payer.email are required" },
        { status: 400 }
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 800));

    // In production: POST to Atlas Core Headless API
    return NextResponse.json({
      success: true,
      payerId: `payer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      message: "Payer registered successfully",
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
