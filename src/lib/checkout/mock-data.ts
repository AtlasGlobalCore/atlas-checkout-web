// ─── Mock Checkout Data ──────────────────────────────────────────────────────
// Simulates the response from the Headless API.

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
    description:
      "Acesso completo a todas as funcionalidades da plataforma durante 12 meses.",
    lineItems: [
      {
        id: "li_1",
        name: "TechNova Premium",
        description: "Assinatura anual",
        quantity: 1,
        unitPrice: 29900,
      },
      {
        id: "li_2",
        name: "Suporte Prioritário",
        description: "Suporte 24/7 via chat",
        quantity: 1,
        unitPrice: 4900,
      },
    ],
    subtotal: 34800,
    tax: 0,
    discount: 4980,
    total: 29820,
    currency: "BRL",
  },
  payerFields: [
    {
      id: "fullName",
      type: "text",
      label: "Nome completo",
      placeholder: "João da Silva",
      required: true,
      validation: {
        minLength: 3,
        message: "Nome deve ter pelo menos 3 caracteres",
      },
    },
    {
      id: "email",
      type: "email",
      label: "E-mail",
      placeholder: "joao@exemplo.com",
      required: true,
      validation: {
        pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
        message: "Insira um e-mail válido",
      },
    },
    {
      id: "cpf",
      type: "cpf",
      label: "CPF",
      placeholder: "000.000.000-00",
      required: true,
      dependsOnMethod: ["pix", "boleto", "credit_card"],
      validation: {
        pattern: "^\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}$",
        message: "CPF inválido",
      },
    },
    {
      id: "phone",
      type: "phone",
      label: "Telefone",
      placeholder: "(11) 99999-9999",
      required: false,
      dependsOnMethod: ["pix"],
    },
    {
      id: "address",
      type: "address",
      label: "Endereço de cobrança",
      placeholder: "Rua, número, bairro, cidade - UF",
      required: true,
      dependsOnMethod: ["credit_card"],
    },
    {
      id: "cnpj",
      type: "cnpj",
      label: "CNPJ (opcional)",
      placeholder: "00.000.000/0000-00",
      required: false,
      dependsOnMethod: ["boleto"],
    },
  ],
  methods: [
    {
      id: "credit_card",
      type: "credit_card",
      label: "Cartão de Crédito",
      description: "Visa, Mastercard, Amex",
      icon: "CreditCard",
      enabled: true,
    },
    {
      id: "pix",
      type: "pix",
      label: "PIX",
      description: "Pagamento instantâneo",
      icon: "QrCode",
      enabled: true,
    },
    {
      id: "crypto",
      type: "crypto",
      label: "Criptomoeda",
      description: "Bitcoin, Ethereum, USDT",
      icon: "Bitcoin",
      enabled: true,
    },
  ],
  metadata: {
    source: "landing_page",
    campaign: "black_friday_2024",
  },
  expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  status: "active",
};
