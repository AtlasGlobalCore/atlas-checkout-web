// ─── CRM Registration + Payment Initiation API (S2S Proxy) ────────────────────
// POST /api/checkout/pay
// Proxies to Atlas Core: POST {ATLAS_CORE_API_URL}/api/public/checkout/{storeSlug}/{linkId}/pay
//
// Two modes:
//   1. Initial payment (no methodId) → Atlas Core decides method, returns gatewayResponse
//   2. Card token payload (cardPayload present) → Atlas Core processes the tokenized payment

import { NextResponse } from "next/server";
import type { PayRequestBody, PayResponseBody } from "@/lib/checkout/types";

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
  try {
    const body: PayRequestBody = await request.json();
    const { sessionId, storeSlug, linkId, payer, methodId, methodType, cardPayload } = body;

    if (!sessionId || !storeSlug || !linkId) {
      return NextResponse.json(
        { error: "sessionId, storeSlug, and linkId are required" },
        { status: 400 }
      );
    }

    if (!payer?.fullName || !payer?.email) {
      return NextResponse.json(
        { error: "payer.fullName and payer.email are required" },
        { status: 400 }
      );
    }

    // ─── Real S2S call to Atlas Core ─────────────────────────────────────────
    const atlasCoreUrl = process.env.ATLAS_CORE_API_URL;

    if (atlasCoreUrl) {
      const coreEndpoint = `${atlasCoreUrl.replace(/\/+$/, "")}/api/public/checkout/${encodeURIComponent(storeSlug)}/${encodeURIComponent(linkId)}/pay`;

      // Build the payload — backend decides method if methodId is not sent
      const corePayload: Record<string, unknown> = {
        sessionId,
        payer,
      };

      // Include methodId/methodType only if the client explicitly sent them
      if (methodId) corePayload.methodId = methodId;
      if (methodType) corePayload.methodType = methodType;
      if (cardPayload) corePayload.cardPayload = cardPayload;

      const coreResponse = await fetch(coreEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.ATLAS_CORE_API_KEY
            ? { Authorization: `Bearer ${process.env.ATLAS_CORE_API_KEY}` }
            : {}),
        },
        body: JSON.stringify(corePayload),
      });

      if (!coreResponse.ok) {
        const errorData = await coreResponse.json().catch(() => ({}));
        return NextResponse.json(
          {
            success: false,
            error: errorData.error || `Atlas Core returned ${coreResponse.status}`,
          },
          { status: coreResponse.status === 400 ? 400 : 502 }
        );
      }

      const coreData = await coreResponse.json();

      const responseBody: PayResponseBody = {
        success: true,
        transactionId: coreData.transactionId || `txn_${Date.now()}`,
        payerId: coreData.payerId,
        methodType: coreData.methodType,
        provider: coreData.provider,
        providerConfig: coreData.providerConfig,
        gatewayResponse: coreData.gatewayResponse || {},
        message: coreData.message,
      };

      return NextResponse.json(responseBody);
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
    // Simulates Atlas Core routing logic. In production, this decision
    // is made by the backend based on routing rules, risk analysis, etc.
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
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
