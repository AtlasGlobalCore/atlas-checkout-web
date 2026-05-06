// ─── IP Geolocation API ─────────────────────────────────────────────────────
// GET /api/geolocation
// Detects the user's IP and returns country code for locale/currency auto-detection.
// Uses multiple free geolocation APIs as fallbacks.

import { NextResponse } from "next/server";

interface GeoResult {
  country?: string;
  city?: string;
  ip?: string;
}

async function detectViaHeaders(request: Request): Promise<GeoResult> {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() || realIp || "";

  if (!ip) return {};

  // Try ip-api.com (free, no key needed)
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode,status`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.status === "success") {
        return { country: data.countryCode, ip };
      }
    }
  } catch { /* try next */ }

  // Fallback: return IP only (client-side will use browser language)
  return { ip };
}

export async function GET(request: Request) {
  try {
    const geo = await detectViaHeaders(request);
    return NextResponse.json(geo);
  } catch {
    return NextResponse.json({});
  }
}
