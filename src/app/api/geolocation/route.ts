// ─── IP Geolocation API ─────────────────────────────────────────────────────
// GET /api/geolocation
// Detects the user's IP and returns country code for locale/currency auto-detection.
// Uses HTTPS-only geolocation providers with graceful fallback.

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

  // Provider 1: ip-api.com (HTTPS endpoint)
  try {
    const res = await fetch(`https://pro.ip-api.com/json/${ip}?fields=countryCode,status&key=demo`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.status === "success" && data.countryCode) {
        return { country: data.countryCode, ip };
      }
    }
  } catch { /* try next */ }

  // Provider 2: ipwho.is (HTTPS, free, no key needed)
  try {
    const res = await fetch(`https://ipwho.is/${ip}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.country_code) {
        return { country: data.country_code, ip };
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
