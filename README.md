# Atlas Checkout Web

<p align="center">
  <strong>Smart Checkout Público — Universal, Multi-idioma, Multimoeda</strong><br/>
  <em>Inspired by Stripe's design philosophy. Built for global commerce.</em>
</p>

---

## Visão Geral

O **Atlas Checkout Web** é uma interface de pagamento universal e de alta conversão, projetada para funcionar em múltiplos domínios (ex: `pay.atlasglobal.digital`). A UI adapta-se automaticamente ao idioma, moeda e campos fiscais do pagador, com base na geolocalização por IP, mantendo sempre a possibilidade de o utilizador alterar manualmente.

### Funcionalidades Principais

| Feature | Descrição |
|---|---|
| **Detecção Automática de Região** | IP geolocation → idioma e moeda pré-selecionados |
| **Multi-idioma** | Português (BR/PT), Inglês, Espanhol |
| **Multimoeda** | BRL, EUR, USD, GBP com conversão automática |
| **Campos Dinâmicos por País** | CPF (BR), NIF (PT/ES/AO/MZ), ou nenhum |
| **Strategy Pattern** | Provedores de pagamento como componentes plugáveis |
| **Loading Progressivo** | Animação com etapas que avançam automaticamente |
| **Mobile-First** | Design responsivo para qualquer dispositivo |
| **Mini-CRM Dinâmico** | Campos do formulário adaptados por método + país |

---

## Arquitetura

```
src/
├── app/
│   ├── api/
│   │   ├── checkout/route.ts          # GET: Sessão de checkout (mock da Headless API)
│   │   └── geolocation/route.ts       # GET: Detecção IP → país/moeda
│   ├── globals.css                    # Tema global (Tailwind CSS 4)
│   ├── layout.tsx                     # Root layout
│   └── page.tsx                       # Entry point → CheckoutPage
│
├── components/
│   ├── checkout/
│   │   ├── strategies/                # Strategy Pattern para provedores
│   │   │   ├── CreditCardStrategy.tsx # Formulário cartão + preview visual
│   │   │   ├── PixStrategy.tsx        # QR Code + código PIX
│   │   │   ├── CryptoStrategy.tsx     # Seleção rede BTC/ETH/USDT
│   │   │   └── index.tsx              # Registry: type → component
│   │   ├── CheckoutPage.tsx           # Layout principal responsivo
│   │   ├── OrderSummary.tsx           # Coluna esquerda: logo + ordem
│   │   ├── PayerForm.tsx              # Formulário dinâmico (país + método)
│   │   ├── PaymentMethodSelector.tsx  # Botões seleção pagamento
│   │   ├── SubmitButton.tsx           # Botão inteligente com estados
│   │   ├── LoadingScreen.tsx          # Loading progressivo animado
│   │   ├── LocaleSwitcher.tsx         # Seletor idioma + moeda
│   │   └── index.ts                   # Barrel exports
│   └── ui/                            # shadcn/ui components
│
└── lib/
    ├── checkout/
    │   ├── types.ts                   # TypeScript interfaces (session, fields, methods)
    │   ├── checkout-store.ts          # Zustand store (estado global)
    │   ├── mock-data.ts               # Dados mock da Headless API
    │   └── utils.ts                   # Máscaras, formatação, conversão
    └── i18n/
        ├── translations.ts            # Strings PT-BR, PT-PT, EN, ES + config moedas
        └── index.tsx                  # React Context, Provider, hooks
```

---

## Dossier Técnico

### Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| Linguagem | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | shadcn/ui (New York) | Radix UI |
| Estado Global | Zustand | 5.x |
| Animações | Framer Motion | 12.x |
| Ícones | Lucide React | 0.525+ |
| ORM | Prisma (disponível) | 6.x |

### Fluxo de Dados

```
┌─────────────┐    IP Detection     ┌──────────────────┐
│  Pagador     │ ──────────────────► │ /api/geolocation │
│  (Browser)   │                    │ → country code   │
└──────┬──────┘                    └──────────────────┘
       │                                   │
       │  Auto-detect locale/currency       ▼
       ▼                           ┌──────────────┐
┌──────────────┐                  │  I18nProvider │
│ /api/checkout│                  │  locale, curr │
│ → session    │                  └──────┬───────┘
│ → fields     │                         │
│ → methods    │                         ▼
└──────┬───────┘               ┌──────────────────┐
       │                       │  CheckoutPage    │
       ▼                       │  ┌─────────────┐ │
┌──────────────┐               │  │ OrderSummary│ │
│  Zustand     │               │  │ PayerForm   │ │
│  Store       │◄──────────────│  │ PaymentSel. │ │
│  (state)     │   read/write   │  │ Strategy    │ │
└──────────────┘               │  │ SubmitBtn   │ │
                               │  └─────────────┘ │
                               └──────────────────┘
```

### Strategy Pattern — Provedores de Pagamento

Cada método de pagamento é implementado como um **Strategy** independente:

```typescript
// strategies/index.tsx — Registry
const strategyMap: Record<string, StrategyComponent> = {
  credit_card: CreditCardStrategy,
  debit_card: CreditCardStrategy,  // reuse
  pix: PixStrategy,
  crypto: CryptoStrategy,
};

// Para adicionar um novo método:
// 1. Criar src/components/checkout/strategies/MbWayStrategy.tsx
// 2. Adicionar ao strategyMap: mbway: MbWayStrategy
// 3. A API retorna { type: "mbway" } → renderiza automaticamente
```

### Detecção de País e Campos Dinâmicos

```typescript
// O PayerForm combina dois filtros:
// 1. dependsOnMethod → campo visível por método de pagamento
// 2. País selecionado → campo fiscal correto

const COUNTRY_TAX_FIELDS: Record<string, PayerField> = {
  BR: { id: "cpf",  label: "CPF",  type: "cpf"  },
  PT: { id: "nif",  label: "NIF",  type: "nif"  },
  AO: { id: "nif",  label: "NIF",  type: "nif"  },
  MZ: { id: "nif",  label: "NUIT", type: "nif" },
  // Outros países → nenhum campo fiscal adicional
};
```

### Sistema i18n & Multimoeda

```
API: /api/geolocation
  ↓ Deteta IP → country code (BR, PT, US, ES...)
  ↓

I18nProvider (React Context)
  ├── locale: "pt-BR" | "pt-PT" | "en" | "es"
  ├── currency: "BRL" | "EUR" | "USD" | "GBP"
  ├── t: TranslationKeys          ← todas as strings traduzidas
  ├── formatAmount(centsBRL)      ← converte + formata na moeda selecionada
  └── setLocale / setCurrency     ← controlo manual do utilizador
```

**Taxas de câmbio** (base BRL):
| De | Para | Rate |
|---|---|---|
| 1 BRL | EUR | 0.18 |
| 1 BRL | USD | 0.20 |
| 1 BRL | GBP | 0.15 |

> Em produção, as taxas são obtidas via API de câmbio em tempo real.

### Loading Progressivo

O ecrã de loading utiliza **Framer Motion** com animações sequenciais:

1. Logo Atlas fade-in + scale
2. Barra de progresso cresce linearmente (~3s)
3. Textos das etapas alternam com slide animation
4. Dots indicadores mudam de cor progressivamente
5. `onComplete` callback → transição para o checkout

---

## Instalação & Desenvolvimento

```bash
# Clone
git clone https://github.com/AtlasGlobalCore/atlas-checkout-web.git
cd atlas-checkout-web

# Instalar dependências
bun install

# Iniciar desenvolvimento
bun run dev
```

### Variáveis de Ambiente

```env
# Opcional: URL da Headless API (em produção)
NEXT_PUBLIC_HEADLESS_API_URL=https://api.atlasglobal.digital

# Opcional: API Key para câmbio em tempo real
NEXT_PUBLIC_EXCHANGE_API_KEY=your_key
```

---

## Domínios Dinâmicos (Vercel)

O checkout está preparado para receber o `storeSlug` e `linkId` via URL:

```
https://pay.atlasglobal.digital/{storeSlug}/{linkId}
```

### Configuração Vercel

1. No dashboard da Vercel, aponte o domínio `pay.atlasglobal.digital`
2. O Next.js App Router extrai os parâmetros dinamicamente:
   ```typescript
   // app/[storeSlug]/[linkId]/page.tsx
   const { storeSlug, linkId } = await params;
   ```
3. A Headless API retorna a configuração completa da sessão

---

## Design System

### Princípios (Stripe-Inspired)

- **Fundo**: Branco puro / cinza muito suave (`slate-50`)
- **Sombras**: Suaves e subtis (`shadow-sm`, `shadow-lg` com opacidade)
- **Tipografia**: Geist Sans, pesos semibold/bold, hierarchy clara
- **Cores**: Neutras (slate), accent em emerald (sucesso) e amber (avisos)
- **Bordas**: Arredondadas (`rounded-xl`, `rounded-2xl`)
- **Sem dark mode forçado**: Design limpo e luminoso

### Responsividade

| Breakpoint | Layout |
|---|---|
| Mobile (<640px) | Coluna única, formulário em cima, resumo em baixo |
| Tablet (640-1023px) | Mesma coluna, mais espaço, descrições visíveis |
| Desktop (1024px+) | Duas colunas (2/5 + 3/5), resumo sticky |

### Touch Targets

Todos os botões e inputs respeitam o mínimo de **44px** de altura em mobile, seguindo as guidelines de acessibilidade.

---

## API Endpoints

### `GET /api/checkout`

Retorna a sessão de checkout completa.

**Query Params:**
| Param | Tipo | Descrição |
|---|---|---|
| `storeSlug` | string | Identificador da loja |
| `linkId` | string | Identificador do link de pagamento |

**Response:**
```json
{
  "id": "cs_live_a1b2c3d4e5f6",
  "store": { "storeName": "...", "primaryColor": "#635bff", "logoUrl": "..." },
  "order": { "title": "...", "total": 29820, "currency": "BRL", "lineItems": [...] },
  "payerFields": [{ "id": "fullName", "type": "text", "required": true, ... }],
  "methods": [{ "id": "credit_card", "type": "credit_card", "enabled": true, ... }],
  "status": "active",
  "expiresAt": "2025-01-01T12:00:00Z"
}
```

### `GET /api/geolocation`

Deteta o país do pagador via IP.

**Headers usados:** `X-Forwarded-For`, `X-Real-IP`

**Response:**
```json
{ "country": "BR", "ip": "189.xxx.xxx.xxx" }
```

---

## Extensibilidade

### Adicionar novo idioma

1. Adicionar o locale em `src/lib/i18n/translations.ts`:
   ```typescript
   export type Locale = "pt-BR" | "pt-PT" | "en" | "es" | "fr";
   export const LOCALES: LocaleConfig[] = [
     ...existing,
     { code: "fr", label: "Français", flag: "🇫🇷", currency: "EUR", country: "FR" },
   ];
   ```
2. Adicionar todas as chaves no objeto `translations`

### Adicionar novo método de pagamento

1. Criar `src/components/checkout/strategies/NewMethodStrategy.tsx`
2. Registar no `strategyMap` em `strategies/index.tsx`
3. A API retorna `{ type: "new_method" }` → renderiza automaticamente

### Adicionar novo campo por país

1. Adicionar em `COUNTRY_TAX_FIELDS` no `PayerForm.tsx`:
   ```typescript
   IT: { id: "codice_fiscale", type: "nif", label: "Codice Fiscale", required: true },
   ```

---

## Licença

Propriedade da **Atlas Global Core**. Todos os direitos reservados.

---

<p align="center">
  <strong>Atlas</strong> — Smart Checkout Infrastructure<br/>
  <a href="https://github.com/AtlasGlobalCore">github.com/AtlasGlobalCore</a>
</p>
