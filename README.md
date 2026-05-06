# Atlas Checkout Web

<p align="center">
  <strong>Smart Payment Router — Multi-provedor, Multi-idioma, Alta Conversão</strong><br/>
  <em>Router de pagamentos dinâmico. Design Stripe-inspired. Segurança built-in.</em>
</p>

---

## Visão Geral

O **Atlas Checkout Web** é um **Smart Payment Router** de alta performance que direciona o pagador para o provedor de pagamento correto com base na configuração da API. O fluxo é de 2 passos: registo do pagador no Mini-CRM → seleção e execução do pagamento.

### Arquitetura: Payment Router

```
┌─────────────┐
│  STEP 1     │  Preenche dados (Nome, Email, Documento)
│  PAYER      │  POST /api/checkout/pay → CRM registration
└──────┬──────┘
       │ ✓ payerId
       ▼
┌─────────────┐
│  STEP 2     │  Seleciona método de pagamento
│  METHODS    │  Strategy Pattern renderiza o componente correto
│             │  ├─ STRIPE_ELEMENTS → Card, Apple Pay, Google Pay
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
| **Payment Router** | 6 provedores via Strategy Pattern, renderização dinâmica por `method_type` |
| **2-Step Flow** | Payer registration first → Payment methods after CRM success |
| **Mini-CRM** | POST /api/checkout/pay → Atlas Core registra pagador |
| **Detecção de Região** | IP geolocation → idioma + moeda + campo fiscal (CPF/NIF) |
| **Multi-idioma** | PT-BR, PT-PT, EN, ES |
| **Multimoeda** | BRL, EUR, USD, GBP com conversão automática |
| **Campos Dinâmicos** | País selecionado → CPF (BR), NIF (PT/ES), NUIT (MZ) |
| **Success Redirect** | Polling deteção → checkmark animado → successUrl em 3s |
| **Segurança** | Meta tags, cadeado, encriptação E2E, CSP headers |

---

## Estrutura de Diretórios

```
src/
├── app/
│   ├── api/checkout/
│   │   ├── route.ts              # GET: Sessão de checkout
│   │   ├── pay/route.ts          # POST: Registo CRM + init pagamento
│   │   └── status/route.ts       # GET: Polling status de pagamento
│   ├── api/geolocation/route.ts   # GET: Detecção IP → país
│   ├── layout.tsx                 # Security metadata + SEO
│   └── page.tsx                   # Entry point
│
├── components/checkout/
│   ├── strategies/                # Strategy Pattern — Payment Router
│   │   ├── StripeElementsStrategy.tsx   # Stripe PaymentElement (Card, Apple/Google Pay)
│   │   ├── PixNativeStrategy.tsx        # QR Code + countdown + copy-paste
│   │   ├── VivaModalStrategy.tsx        # Modal redirect Viva Wallet
│   │   ├── SepaInstantStrategy.tsx      # IBAN + envio por email (Resend)
│   │   ├── MbWayFlowStrategy.tsx        # Telemóvel → Atlas Core command
│   │   ├── CryptoNativeStrategy.tsx     # BTC, ETH, USDT
│   │   └── index.tsx                    # Registry (legado)
│   ├── CheckoutPage.tsx           # Layout principal + step flow
│   ├── SuccessScreen.tsx          # Checkmark animado + redirect
│   ├── OrderSummary.tsx           # Resumo da ordem
│   ├── PayerForm.tsx              # Formulário dinâmico por país
│   ├── PaymentMethodSelector.tsx  # Seletor de métodos
│   ├── LoadingScreen.tsx          # Loading progressivo
│   └── LocaleSwitcher.tsx         # Idioma + Moeda
│
└── lib/
    ├── checkout/
    │   ├── types.ts               # Tipos: CheckoutSession, PaymentMethodType, CheckoutStep
    │   ├── checkout-store.ts      # Zustand store (step-based state machine)
    │   ├── mock-data.ts           # Mock da Headless API
    │   └── utils.ts               # Máscaras, formatCurrency, getCardBrand
    └── i18n/
        ├── translations.ts        # 4 idiomas + currency config
        └── index.tsx              # React Context + useDetectLocale hook
```

---

## Dossier Técnico

### Payment Router — Strategy Pattern

Cada método de pagamento é um **Strategy** independente, seleccionado pelo campo `method_type` retornado pela API:

```typescript
type PaymentMethodType =
  | "STRIPE_ELEMENTS"   // Cartão nativo via Stripe PaymentElement
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
                                 (fields, methods, successUrl)

2. User preenche dados

3. POST /api/checkout/pay   →   Regista pagador no CRM
   { sessionId, payer }          Retorna { payerId }

4. User seleciona método        (ex: PIX, MB WAY, Stripe)

5. Strategy renderiza UI
   (PIX: QR Code, MB WAY: telemóvel, etc.)

6. User confirma pagamento

7. GET /api/checkout/status →   Polling: { status: "paid" }

8. SUCCESS screen → redirect → successUrl
```

### API Endpoints

| Endpoint | Método | Descrição |
|---|---|---|
| `/api/checkout` | GET | Retorna sessão de checkout completa |
| `/api/checkout/pay` | POST | Regista pagador no CRM, retorna payerId |
| `/api/checkout/status` | GET | Polling: status do pagamento |
| `/api/geolocation` | GET | Detecção de país via IP |

### Tipos de Pagamento

#### STRIPE_ELEMENTS
- Simulação do PaymentElement (Card, Apple Pay, Google Pay)
- Em produção: integrar `@stripe/react-stripe-js` + `PaymentElement`
- Suporta 3D Secure, SCA, e todos os meios internacionais

#### PIX_NATIVE
- QR Code visual com countdown de expiração
- Código PIX "Copia e Cola"
- Botão de refresh para novo QR
- Polling automático para deteção de pagamento

#### VIVA_MODAL
- Trigger que abre modal/redirect para Viva Wallet
- Usa `chargeToken` da configuração
- Notificação de redirecionamento seguro

#### SEPA_INSTANT
- Exibe IBAN do beneficiário (ATLAS GLOBAL CORE LDA)
- BIC/SWIFT + referência da sessão
- Botão "Enviar por Email" (via Resend API)
- Nota: processamento < 10 segundos

#### MBWAY_FLOW
- Input de telemóvel com máscara portuguesa (+351)
- 3 estágios: `input` → `sent` → `confirming`
- Comando enviado ao Atlas Core
- Pulse animation enquanto aguarda confirmação

#### CRYPTO_NATIVE
- Seletor de rede (Bitcoin, Ethereum, USDT)
- Endereço da carteira com botão de cópia
- Link para block explorer
- Aviso de envio de token/rede correcto

### Segurança & SEO

```html
<!-- Security Meta Tags -->
<meta name="referrer" content="strict-origin-when-cross-origin" />
<meta http-equiv="X-Content-Type-Options" content="nosniff" />

<!-- Open Graph -->
<meta property="og:title" content="Atlas Checkout — Secure Smart Payment" />
<meta property="og:description" content="Pagamento seguro com encriptação de ponta a ponta." />

<!-- Theme -->
<meta name="theme-color" content="#ffffff" />
```

### Extensibilidade

**Adicionar novo provedor de pagamento:**

1. Criar `src/components/checkout/strategies/NewProviderStrategy.tsx`
2. Adicionar o tipo em `PaymentMethodType` (`types.ts`)
3. Adicionar case no `StrategySwitch` (`CheckoutPage.tsx`)
4. A API retorna `{ method_type: "NEW_PROVIDER" }` → renderiza automaticamente

**Adicionar novo país:**

1. Adicionar entrada em `COUNTRY_DOC_FIELD` (`PayerForm.tsx`)
2. Adicionar opção no `COUNTRY_OPTIONS`

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
