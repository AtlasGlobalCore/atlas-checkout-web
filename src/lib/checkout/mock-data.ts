// ─── Mock Data — Atlas Payment Router ───────────────────────────────────────

import type { CheckoutSession } from "./types";

export const mockCheckoutSession: CheckoutSession = {
  id: "cs_live_a1b2c3d4e5f6",
  storeSlug: "loja-exemplo",
  linkId: "lnk_xyz789",
  store: {
    logoUrl: "/store-logo.svg",
    storeName: "TechNova Store",
    primaryColor: "#635bff",
    accentColor: "#00d4aa",
  },
  order: {
    id: "ord_001",
    title: "Plano Premium Anual",
    description: "Acesso completo a todas as funcionalidades da plataforma durante 12 meses.",
    lineItems: [
      { id: "li_1", name: "TechNova Premium", description: "Assinatura anual", quantity: 1, unitPrice: 29900 },
      { id: "li_2", name: "Suporte Prioritário", description: "Suporte 24/7 via chat", quantity: 1, unitPrice: 4900 },
    ],
    subtotal: 34800,
    tax: 0,
    discount: 4980,
    total: 29820,
    currency: "BRL",
  },
  payerFields: [
    { id: "fullName", type: "text", label: "Nome completo", placeholder: "João da Silva", required: true, validation: { minLength: 3, message: "Mínimo 3 caracteres" } },
    { id: "email", type: "email", label: "E-mail", placeholder: "joao@exemplo.com", required: true, validation: { pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", message: "E-mail inválido" } },
    { id: "phone", type: "phone", label: "Telefone", placeholder: "(11) 99999-9999", required: false },
    { id: "document", type: "cpf", label: "CPF", placeholder: "000.000.000-00", required: true },
  ],
  methods: [
    { id: "stripe_elements", method_type: "STRIPE_ELEMENTS", label: "Cartão de Crédito", description: "Visa, Mastercard, Amex, Apple Pay", icon: "CreditCard", enabled: true, config: { publishableKey: "pk_test_mock" } },
    { id: "pix_native", method_type: "PIX_NATIVE", label: "PIX", description: "Pagamento instantâneo via QR Code", icon: "QrCode", enabled: true },
    { id: "viva_modal", method_type: "VIVA_MODAL", label: "Viva Wallet", description: "Cartão ou multibanco", icon: "Wallet", enabled: true },
    { id: "sepa_instant", method_type: "SEPA_INSTANT", label: "Transferência SEPA", description: "IBAN instantâneo", icon: "Landmark", enabled: true },
    { id: "mbway_flow", method_type: "MBWAY_FLOW", label: "MB WAY", description: "Pagamento por telemóvel", icon: "Smartphone", enabled: true },
    { id: "crypto_native", method_type: "CRYPTO_NATIVE", label: "Criptomoeda", description: "Bitcoin, Ethereum, USDT", icon: "Bitcoin", enabled: true },
  ],
  successUrl: "https://technova.com/obrigado",
  cancelUrl: "https://technova.com/checkout/cancelado",
  expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  status: "active",
  metadata: { source: "landing_page", campaign: "black_friday_2024" },
};
