// ─── CRM Registration + Payment Initiation API (S2S Proxy) ────────────────────
// POST /api/checkout/pay
// Proxies to Atlas Core: POST {ATLAS_CORE_API_URL}/api/public/checkout/{storeSlug}/{linkId}/pay
//
// Two modes:
//   1. Initial payment (no methodId) → Atlas Core decides method, returns gatewayResponse
//   2. Card token payload (cardPayload present) → Atlas Core processes the tokenized payment
//
// Hardening:
//   - AbortController timeout (12s) for S2S calls
//   - x-correlation-id forwarded and generated
//   - Structured error mapping (4xx/5xx)
//   - Secrets never exposed in responses

import { NextResponse } from "next/server";
import type { PayRequestBody, PayResponseBody } from "@/lib/checkout/types";

// ─── Constants ──────────────────────────────────────────────────────────────
const S2S_TIMEOUT_MS = 12_000; // 12 seconds for Atlas Core response
const MAX_RETRIES = 1;         // One retry on network failure (not on 4xx)

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Generate a correlation ID for request tracing */
function generateCorrelationId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `atlas-${ts}-${rand}`;
}

/** Create an AbortController with a timeout */
function createTimeoutController(ms: number): AbortController {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  // Store timer for cleanup
  (controller as AbortController & { _timer?: NodeJS.Timeout })._timer = timer;
  return controller;
}

/** Clean up a timeout controller */
function cleanupController(controller: AbortController) {
  const timer = (controller as AbortController & { _timer?: NodeJS.Timeout })._timer;
  if (timer) clearTimeout(timer);
}

// ─── Mock Gateway Responses (fallback when ATLAS_CORE_API_URL is not set) ────
function getMockGatewayResponse(methodType: string) {
  switch (methodType) {
    case "STRIPE_ELEMENTS":
      return {
        client_secret: "pi_mock_secret_abc123def456",
        publishable_key: "pk_test_mock_stripe_key",
      };
    case "PIX_NATIVE":
      return {
        qr_code_base64: "",
        pix_code:
          "00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef1234567890204000053039865802BR5925TECHNOVA STORE LTDA6009SAO PAULO62070503***63041D3D",
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      };
    case "VIVA_MODAL":
      return {
        charge_token: "ctk_mock_viva_token_xyz789",
        redirect_url: "https://www.vivapayments.com/webcheckout?ref=ctk_mock_viva_token_xyz789",
      };
    case "SEPA_INSTANT":
      return {
        beneficiary_name: "ATLAS GLOBAL CORE LDA",
        iban: "PT50 1234 5678 9012 3456 78901 234",
        bic_swift: "ATLSPT21",
        reference: "REF-ATLAS-2024-001",
      };
    case "MBWAY_FLOW":
      return {
        phone: "+351912345678",
        mbway_request_id: "mbw_req_mock_001",
      };
    case "CRYPTO_NATIVE":
      return {
        wallet_address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        network: "bitcoin",
        estimated_amount: "0.00043",
      };
    default:
      return {};
  }
}

export async function POST(request: Request) {
  const correlationId = generateCorrelationId();

  try {
    const body: PayRequestBody = await request.json();
    const { sessionId, storeSlug, linkId, payer, methodId, methodType, cardPayload } = body;

    // ─── Validation ───────────────────────────────────────────────────────
    if (!sessionId || !storeSlug || !linkId) {
      return NextResponse.json(
        { success: false, error: "sessionId, storeSlug, and linkId are required", code: "MISSING_PARAMS" },
        { status: 400 }
      );
    }

    if (!payer?.fullName || !payer?.email) {
      return NextResponse.json(
        { success: false, error: "payer.fullName and payer.email are required", code: "MISSING_PAYER" },
        { status: 400 }
      );
    }

    // ─── Real S2S call to Atlas Core ─────────────────────────────────────
    const atlasCoreUrl = process.env.ATLAS_CORE_API_URL;

    if (atlasCoreUrl) {
      const coreEndpoint = `${atlasCoreUrl.replace(/\/+$/, "")}/api/public/checkout/${encodeURIComponent(storeSlug)}/${encodeURIComponent(linkId)}/pay`;

      // Build the payload — backend decides method if methodId is not sent
      const corePayload: Record<string, unknown> = {
        sessionId,
        payer: {
          fullName: payer.fullName,
          email: payer.email,
          phone: payer.phone,
          document: payer.document,
          country: payer.country,
        },
      };

      // Include methodId/methodType only if the client explicitly sent them
      if (methodId) corePayload.methodId = methodId;
      if (methodType) corePayload.methodType = methodType;
      if (cardPayload) corePayload.cardPayload = cardPayload;

      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        const controller = createTimeoutController(S2S_TIMEOUT_MS);

        try {
          const coreResponse = await fetch(coreEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Correlation-ID": correlationId,
              ...(process.env.ATLAS_CORE_API_KEY
                ? { Authorization: `Bearer ${process.env.ATLAS_CORE_API_KEY}` }
                : {}),
            },
            body: JSON.stringify(corePayload),
            signal: controller.signal,
          });

          cleanupController(controller);

          // 4xx — client error, no retry
          if (coreResponse.status >= 400 && coreResponse.status < 500) {
            const errorData = await coreResponse.json().catch(() => ({}));
            const clientError = (errorData.error as string) || `Client error (${coreResponse.status})`;
            console.warn(`[Pay Proxy] 4xx from Atlas Core [${correlationId}]: ${clientError}`);

            return NextResponse.json(
              {
                success: false,
                error: clientError,
                code: `CORE_${coreResponse.status}`,
              },
              { status: 400 }
            );
          }

          // 5xx — server error, may retry
          if (!coreResponse.ok) {
            const errorData = await coreResponse.json().catch(() => ({}));
            lastError = new Error((errorData.error as string) || `Atlas Core returned ${coreResponse.status}`);

            if (attempt < MAX_RETRIES) {
              console.warn(`[Pay Proxy] 5xx from Atlas Core, retrying [${correlationId}]: attempt ${attempt + 1}`);
              continue;
            }

            console.error(`[Pay Proxy] Atlas Core failed after retries [${correlationId}]:`, lastError.message);
            return NextResponse.json(
              {
                success: false,
                error: "Serviço de pagamento temporariamente indisponível. Tente novamente.",
                code: "CORE_UNAVAILABLE",
              },
              { status: 502 }
            );
          }

          // Success
          const coreData = await coreResponse.json();

          const responseBody: PayResponseBody = {
            success: true,
            transactionId: coreData.transactionId || `txn_${Date.now()}`,
            payerId: coreData.payerId,
            methodType: coreData.methodType,
            methodId: coreData.methodId,
            provider: coreData.provider,
            providerConfig: coreData.providerConfig,
            gatewayResponse: coreData.gatewayResponse || {},
            message: coreData.message,
          };

          return NextResponse.json(responseBody);
        } catch (err) {
          cleanupController(controller);

          // Timeout or network error
          if (err instanceof DOMException && err.name === "AbortError") {
            lastError = new Error("Atlas Core timeout");
            if (attempt < MAX_RETRIES) {
              console.warn(`[Pay Proxy] Timeout from Atlas Core, retrying [${correlationId}]: attempt ${attempt + 1}`);
              continue;
            }
          } else {
            lastError = err instanceof Error ? err : new Error("Network error");
            if (attempt < MAX_RETRIES) {
              console.warn(`[Pay Proxy] Network error, retrying [${correlationId}]:`, lastError.message);
              continue;
            }
          }
        }
      }

      // All retries exhausted
      console.error(`[Pay Proxy] All retries exhausted [${correlationId}]:`, lastError?.message);
      return NextResponse.json(
        {
          success: false,
          error: "Serviço de pagamento temporariamente indisponível. Tente novamente.",
          code: "CORE_TIMEOUT",
        },
        { status: 504 }
      );
    }

    // ─── Mock fallback (development) ────────────────────────────────────────
    await new Promise((resolve) => setTimeout(resolve, 600));

    // If cardPayload is present (MP_001 tokenized card), simulate success
    if (cardPayload) {
      const responseBody: PayResponseBody = {
        success: true,
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        payerId: `payer_${Date.now()}`,
        methodType: methodType || ("STRIPE_ELEMENTS" as const),
        provider: cardPayload.provider,
        gatewayResponse: {
          status: "approved",
          status_detail: "accredited",
          card_token: cardPayload.token,
        },
        message: "Pagamento aprovado (mock)",
      };

      return NextResponse.json(responseBody);
    }

    // ─── Mock: Backend decides the payment method ──────────────────────────
    const mockMethodType = methodType || ("STRIPE_ELEMENTS" as const);
    const mockProvider = "MP_001";
    const mockMethodId = "mp_card";
    const mockProviderConfig = {
      publicKey: "APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    };

    const mockGateway = getMockGatewayResponse(mockMethodType);

    const responseBody: PayResponseBody = {
      success: true,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      payerId: `payer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      methodType: mockMethodType,
      methodId: mockMethodId,
      provider: mockProvider,
      providerConfig: mockProviderConfig,
      gatewayResponse: mockGateway,
      message: "Payer registered and payment initiated (mock)",
    };

    return NextResponse.json(responseBody);
  } catch (err) {
    // Unexpected error (e.g., invalid JSON body)
    console.error(`[Pay Proxy] Unexpected error [${correlationId}]:`, err);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
