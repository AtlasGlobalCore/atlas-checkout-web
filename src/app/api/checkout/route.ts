// ─── Checkout API Route ─────────────────────────────────────────────────────
// GET /api/checkout?storeSlug=xxx&linkId=xxx
// Returns the checkout session configuration.

import { NextResponse } from "next/server";
import { mockCheckoutSession } from "@/lib/checkout/mock-data";
import type { CheckoutSession } from "@/lib/checkout/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const storeSlug = searchParams.get("storeSlug");
  const linkId = searchParams.get("linkId");

  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  // In production, this would fetch from the Headless API:
  // const res = await fetch(`${HEADLESS_API}/checkout/${storeSlug}/${linkId}`);
  // const session = await res.json();

  if (!storeSlug || !linkId) {
    return NextResponse.json(
      { error: "storeSlug and linkId are required" },
      { status: 400 }
    );
  }

  // Return mock data with dynamic slugs
  const session: CheckoutSession = {
    ...mockCheckoutSession,
    storeSlug,
    linkId,
  };

  return NextResponse.json(session);
}
