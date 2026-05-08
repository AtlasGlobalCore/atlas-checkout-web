// ─── Payment Status Polling API ─────────────────────────────────────────────
// GET /api/checkout/status?sessionId=xxx&transactionId=xxx
//
// Proxies to Atlas Core: GET {ATLAS_CORE_API_URL}/api/public/checkout/{sessionId}/status
// Falls back to mock when ATLAS_CORE_API_URL is not set.

import { NextResponse } from "next/server";
import type { PaymentStatus, PaymentStatusResponse } from "@/lib/checkout/types";

// ─── Status mapping (backend → frontend) ────────────────────────────────────
const STATUS_MAP: Record<string, PaymentStatus> = {
  pending: "pending",
  processing: "processing",
  paid: "paid",
  authorized: "paid",
  approved: "paid",
  completed: "paid",
  failed: "failed",
  rejected: "failed",
  cancelled: "expired",
  canceled: "expired",
  expired: "expired",
  refunded: "failed",
  chargeback: "failed",
};

function mapStatus(raw: string): PaymentStatus {
  const normalized = (raw || "").toLowerCase().trim();
  return STATUS_MAP[normalized] || "pending";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const transactionId = searchParams.get("transactionId");

  if (!sessionId) {
    return NextResponse.json(
      { error: "sessionId is required", code: "MISSING_SESSION_ID" },
      { status: 400 }
    );
  }

  // ─── Real S2S call to Atlas Core ─────────────────────────────────────────
  const atlasCoreUrl = process.env.ATLAS_CORE_API_URL;

  if (atlasCoreUrl) {
    const coreEndpoint = `${atlasCoreUrl.replace(/\/+$/, "")}/api/public/checkout/${encodeURIComponent(sessionId)}/status`;

    // Build query params
    const params = new URLSearchParams();
    if (transactionId) params.set("transactionId", transactionId);
    const query = params.toString();
    const url = query ? `${coreEndpoint}?${query}` : coreEndpoint;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const coreResponse = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.ATLAS_CORE_API_KEY
            ? { Authorization: `Bearer ${process.env.ATLAS_CORE_API_KEY}` }
            : {}),
          // Forward correlation ID if present
          ...(request.headers.get("x-correlation-id")
            ? { "X-Correlation-ID": request.headers.get("x-correlation-id")! }
            : {}),
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!coreResponse.ok) {
        const errorData = await coreResponse.json().catch(() => ({}));
        return NextResponse.json(
          {
            error: errorData.error || `Status service returned ${coreResponse.status}`,
            code: "STATUS_SERVICE_ERROR",
          },
          { status: coreResponse.status >= 500 ? 502 : 400 }
        );
      }

      const coreData = await coreResponse.json();

      const response: PaymentStatusResponse = {
        sessionId,
        status: mapStatus(coreData.status || coreData.paymentStatus || "pending"),
        successUrl: coreData.successUrl,
      };

      return NextResponse.json(response);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return NextResponse.json(
          { error: "Status service timed out", code: "STATUS_TIMEOUT" },
          { status: 504 }
        );
      }

      // Network error — return pending (graceful degradation, don't break UX)
      const response: PaymentStatusResponse = {
        sessionId,
        status: "pending",
      };
      return NextResponse.json(response);
    }
  }

  // ─── Mock fallback (development) ────────────────────────────────────────
  // Simulates a payment that transitions from pending → paid after a delay
  const response: PaymentStatusResponse = {
    sessionId,
    status: "pending",
  };

  return NextResponse.json(response);
}
