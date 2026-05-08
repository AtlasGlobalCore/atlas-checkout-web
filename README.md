# Atlas Checkout Web

<p align="center">
  <strong>Smart Payment Router — Multi-provedor, Backend-Driven, Alta Conversão</strong><br/>
  <em>Router de pagamentos dinâmico. Design agnóstico. Segurança built-in.</em>
</p>

---

## Visão Geral

O **Atlas Checkout Web** é um **Smart Payment Router** de alta performance que direciona o pagador para o provedor de pagamento correto com base na configuração devolvida pela API do Atlas Core. O frontend é um **"dumb renderer"** — o backend decide qual método de pagamento usar após receber os dados do pagador.

### Princípio Arquitectural: Backend-Driven

```
O frontend NÃO decide qual método de pagamento usar.
O backend (Atlas Core) decide tudo e devolve:
  - methodType: qual estratégia renderizar
  - provider: qual provedor usar (MP_001, PICPAY_001, etc.)
  - providerConfig: chaves e config do provedor
  - gatewayResponse: dados específicos do gateway
```

### Arquitetura: Payment Router

```
┌─────────────┐
│  STEP 1     │  Preenche dados APENAS (Nome, Email, Documento)
│  PAYER      │  POST /api/checkout/pay → { sessionId, payer }
└──────┬──────┘
       │ Backend decide método → { methodType, provider, gatewayResponse }
       ▼
┌─────────────┐
│  STEP 2     │  Strategy Pattern renderiza o componente correto
│  METHODS    │  ├─ STRIPE_ELEMENTS → CreditCardStrategy (agnóstica)
│             │  │   ├─ MP_001: tokenização via mp.createCardToken()
│             │  │   └─ Outros: card data genérico
│             │  ├─ PIX_NATIVE      → QR Code + Copia e Cola
│             │  ├─ VIVA_MODAL      → Modal Viva Wallet
│             │  ├─ SEPA_INSTANT    → IBAN + Envio por Email
│             │  ├─ MBWAY_FLOW      → Telemóvel → Confirmação
│             │  └─ CRYPTO_NATIVE   → BTC, ETH, USDT
└──────┬──────┘
       │ ✓ payment success
       ▼
┌─────────────┐
│  SUCCESS    │  Checkmark animado + redirect (3s)
│  SCREEN     │  → successUrl da API
└─────────────┘
```

### Funcionalidades

| Feature | Detalhes |
|---|---|
| **Backend-Driven** | Frontend não seleciona método — backend decide via /pay response |
| **Payment Router** | 6 estratégias via Strategy Pattern, renderização dinâmica por `method_type` |
| **2-Step Flow** | Dados do pagador → Backend decide → Renderiza UI do método |
| **MP_001 (Mercado Pago)** | SDK silencioso, tokenização agnóstica, installments |
| **Detecção de Região** | IP geolocation → idioma + moeda + campo fiscal (CPF/NIF) |
| **Multi-idioma** | PT-BR, PT-PT, EN, ES |
| **Multimoeda** | BRL, EUR, USD, GBP com conversão automática |
| **Campos Dinâmicos** | País selecionado → CPF (BR), NIF (PT/ES), NUIT (MZ) |
| **Hardened Proxy** | Timeout, retry, correlation-id, error mapping granular |
| **Status Polling** | Proxy real para Atlas Core com mapeamento de status |
| **Segurança** | HTTPS-only APIs, meta tags, CSP headers, sem secrets no frontend |

---

## Estrutura de Diretórios

```
src/
├── app/
│   ├── api/checkout/
│   │   ├── route.ts              # GET: Sessão de checkout
│   │   ├── pay/route.ts          # POST: Proxy S2S → Atlas Core (timeout, retry, correlation-id)
│   │   └── status/route.ts       # GET: Proxy S2S → Atlas Core status (real polling)
│   ├── api/geolocation/route.ts   # GET: Detecção IP → país (HTTPS-only)
│   ├── layout.tsx                 # Security metadata + SEO
│   └── page.tsx                   # Entry point
│
├── components/checkout/
│   ├── strategies/                # Strategy Pattern — Payment Router
│   │   ├── index.tsx                    # Registry + StrategySwitch
│   │   ├── CreditCardStrategy.tsx       # Agnostic card form (MP_001 tokenization)
│   │   ├── StripeElementsStrategy.tsx   # Stripe PaymentElement (legacy)
│   │   ├── PixNativeStrategy.tsx        # QR Code + countdown + copy-paste
│   │   ├── VivaModalStrategy.tsx        # Modal redirect Viva Wallet
│   │   ├── SepaInstantStrategy.tsx      # IBAN + envio por email
│   │   ├── MbWayFlowStrategy.tsx        # Telemóvel → Confirmação
│   │   └── CryptoNativeStrategy.tsx     # BTC, ETH, USDT
│   ├── CheckoutPage.tsx           # Layout principal + step flow
│   ├── SuccessScreen.tsx          # Checkmark animado + redirect
│   ├── OrderSummary.tsx           # Resumo da ordem
│   ├── PayerForm.tsx              # Formulário dinâmico por país
│   ├── LoadingScreen.tsx          # Loading progressivo
│   └── LocaleSwitcher.tsx         # Idioma + Moeda
│
└── lib/
    ├── checkout/
    │   ├── types.ts               # Tipos: PayResponseBody (union), CheckoutSession, ResolvedMethod
    │   ├── checkout-store.ts      # Zustand store (step-based state machine)
    │   ├── mp-loader.ts           # Mercado Pago SDK loader (silent, singleton)
    │   ├── mock-data.ts           # Mock da Headless API
    │   └── utils.ts               # Máscaras, formatCurrency, getCardBrand
    └── i18n/
        ├── translations.ts        # 4 idiomas + currency config
        └── index.tsx              # React Context + useDetectLocale hook
```

---

## Dossier Técnico

### FE/BE Contract — Pay Response (Union Type)

```typescript
// Sucesso
interface PayResponseSuccess {
  success: true;
  transactionId: string;
  payerId?: string;
  methodType: PaymentMethodType;
  provider?: string;              // "MP_001", "PICPAY_001", etc.
  providerConfig?: Record<string, unknown>;
  gatewayResponse: GatewayResponse;
  message?: string;
}

// Erro
interface PayResponseError {
  success: false;
  error: string;
  code?: string;                  // Machine-readable code for support
}

type PayResponseBody = PayResponseSuccess | PayResponseError;
```

### Payment Router — Strategy Pattern

Cada método de pagamento é um **Strategy** independente, seleccionado pelo campo `methodType` retornado pela API:

```typescript
type PaymentMethodType =
  | "STRIPE_ELEMENTS"   // Card agnóstico (MP_001 ou outro)
  | "PIX_NATIVE"        // QR Code + copia e cola
  | "VIVA_MODAL"        // Redirect para Viva Wallet
  | "SEPA_INSTANT"      // IBAN + transferência instantânea
  | "MBWAY_FLOW"        // Input telemóvel → MB WAY
  | "CRYPTO_NATIVE";    // BTC, ETH, USDT
```

### Fluxo de Integração com Atlas Core

```
Frontend                        Atlas Core API
─────────                       ──────────────
1. GET /api/checkout       →    Retorna CheckoutSession
                                 (payerFields, methods, successUrl)

2. User preenche dados
   (Step 1: PayerForm only)

3. POST /api/checkout/pay   →   Regista pagador + decide método
   { sessionId, payer }          Retorna { methodType, provider,
                                 providerConfig, gatewayResponse }

4. Frontend renderiza a UI do
   método decidido pelo backend
   (Step 2: Strategy render)

5. User confirma pagamento
   (card tokenization, QR, etc.)

6. POST /api/checkout/pay   →   Processa pagamento
   { cardPayload }               Retorna { success: true }

7. GET /api/checkout/status →   Polling: { status: "paid" }
   ?sessionId=xxx&transactionId=xxx

8. SUCCESS screen → redirect → successUrl
```

### API Endpoints

| Endpoint | Método | Descrição |
|---|---|---|
| `/api/checkout` | GET | Retorna sessão de checkout completa |
| `/api/checkout/pay` | POST | Proxy S2S → Atlas Core: regista pagador + decide método |
| `/api/checkout/status` | GET | Proxy S2S → Atlas Core: polling de status |
| `/api/geolocation` | GET | Detecção de país via IP (HTTPS-only) |

### Hardening — S2S Proxy

| Feature | Detalhes |
|---|---|
| **Timeout** | AbortController com 12s para Atlas Core |
| **Retry** | 1 retry automático em network/5xx errors |
| **Correlation ID** | `x-correlation-id` gerado e forwarding |
| **Error Mapping** | 4xx sem retry, 5xx com retry, codes máquina-legíveis |
| **Graceful Degradation** | Status polling retorna `pending` se backend timeout |
| **No Secrets** | API keys nunca expostas em responses |

### Environment Variables

| Variable | Descrição | Required |
|---|---|---|
| `ATLAS_CORE_API_URL` | URL base da Atlas Core API | Yes (prod) |
| `ATLAS_CORE_API_KEY` | Bearer token para autenticação S2S | No |

---

## Instalação

```bash
git clone https://github.com/AtlasGlobalCore/atlas-checkout-web.git
cd atlas-checkout-web
bun install
bun run dev
```

---

## Deploy (Vercel)

O checkout suporta domínios dinâmicos:
```
https://pay.atlasglobal.digital/{storeSlug}/{linkId}
```

Variáveis de ambiente a configurar:
- `ATLAS_CORE_API_URL`
- `ATLAS_CORE_API_KEY` (opcional)

---

## Stack

| Tecnologia | Versão |
|---|---|
| Next.js (App Router) | 16.x |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| shadcn/ui | Radix UI |
| Zustand | 5.x |
| Framer Motion | 12.x |
| Lucide React | 0.525+ |

---

## Licença

Propriedade da **Atlas Global Core**. Todos os direitos reservados.

<p align="center">
  <strong>Atlas</strong> — Smart Payment Infrastructure<br/>
  <a href="https://github.com/AtlasGlobalCore">github.com/AtlasGlobalCore</a>
</p>
