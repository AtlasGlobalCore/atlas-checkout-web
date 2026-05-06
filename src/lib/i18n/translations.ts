// ─── Atlas Checkout — Internationalization Translations ──────────────────────
// Supported locales: pt-BR, pt-PT, en, es

export type Locale = "pt-BR" | "pt-PT" | "en" | "es";

export interface LocaleConfig {
  code: Locale;
  label: string;
  flag: string;
  currency: string;
  country: string;
}

export const LOCALES: LocaleConfig[] = [
  { code: "pt-BR", label: "Português (BR)", flag: "🇧🇷", currency: "BRL", country: "BR" },
  { code: "pt-PT", label: "Português (PT)", flag: "🇵🇹", currency: "EUR", country: "PT" },
  { code: "en",    label: "English",        flag: "🇺🇸", currency: "USD", country: "US" },
  { code: "es",    label: "Español",         flag: "🇪🇸", currency: "EUR", country: "ES" },
];

export const CURRENCIES: Record<string, { symbol: string; label: string; locale: string }> = {
  BRL: { symbol: "R$",   label: "Real Brasileiro",    locale: "pt-BR" },
  EUR: { symbol: "€",    label: "Euro",               locale: "pt-PT" },
  USD: { symbol: "$",    label: "Dólar Americano",    locale: "en-US" },
  GBP: { symbol: "£",    label: "Libra Esterlina",    locale: "en-GB" },
};

// Exchange rates (base: BRL). In production, fetch from an API.
export const EXCHANGE_RATES: Record<string, number> = {
  BRL: 1,
  EUR: 0.18,
  USD: 0.20,
  GBP: 0.15,
};

type TranslationKeys = {
  // General
  loading: string;
  loadingSteps: string[];
  secureCheckout: string;
  dataProtected: string;
  poweredBy: string;
  tryAgain: string;

  // Errors
  errorTitle: string;
  errorLoading: string;
  paymentError: string;
  unknownError: string;

  // Order Summary
  subtotal: string;
  taxes: string;
  discount: string;
  total: string;
  offerExpires: string;
  offerUrgent: string;
  minutesRemaining: string;

  // Payer Form
  yourData: string;

  // Payment Method
  paymentMethod: string;
  selectMethod: string;

  // Credit Card
  cardNumber: string;
  cardHolder: string;
  cardExpiry: string;
  cardCvv: string;
  cardPreviewName: string;
  cardPreviewExpiry: string;
  securityNotice: string;

  // PIX
  awaitingPayment: string;
  totalAmount: string;
  copyPixCode: string;
  copied: string;
  copy: string;
  generateNewQr: string;

  // Crypto
  amountIn: string;
  approximately: string;
  selectNetwork: string;
  walletAddress: string;
  copyAddress: string;
  cryptoWarning: string;
  payWithWallet: string;

  // Submit
  payWith: string;
  processing: string;
  paymentConfirmed: string;
  paymentSuccessMessage: string;
  paymentProcessed: string;
  redirectToStore: string;
  goToStore: string;
  redirectingIn: string;
  selectToContinue: string;

  // Step flow
  continueToPayment: string;
  backToDetails: string;
  yourDataDescription: string;

  // SEPA
  beneficiary: string;
  iban: string;
  bic: string;
  reference: string;
  sendByEmail: string;
  copyIban: string;
  sepaNote: string;

  // MB WAY
  mbwayPhoneLabel: string;
  sendMbwayRequest: string;
  mbwaySentTitle: string;
  mbwaySentDescription: string;
  mbwayConfirming: string;
  mbwayCancel: string;

  // Viva
  openVivaWallet: string;
  vivaRedirectNote: string;

  // Language/Currency
  language: string;
  currency: string;
};

const translations: Record<Locale, TranslationKeys> = {
  "pt-BR": {
    loading: "Preparando seu checkout...",
    loadingSteps: [
      "Carregando dados da loja...",
      "Verificando métodos de pagamento...",
      "Preparando ambiente seguro...",
      "Quase pronto...",
    ],
    secureCheckout: "Checkout seguro",
    dataProtected: "Dados protegidos",
    poweredBy: "Powered by",
    tryAgain: "Tentar novamente",
    errorTitle: "Algo deu errado",
    errorLoading: "Erro ao carregar checkout",
    paymentError: "Ocorreu um erro ao processar o pagamento. Tente novamente.",
    unknownError: "Erro desconhecido",
    subtotal: "Subtotal",
    taxes: "Impostos",
    discount: "Desconto",
    total: "Total",
    offerExpires: "Oferta expira em",
    offerUrgent: "Esta oferta expira em",
    minutesRemaining: "restantes",
    yourData: "Seus dados",
    paymentMethod: "Método de pagamento",
    selectMethod: "Selecione um método",
    cardNumber: "Número do cartão",
    cardHolder: "Nome no cartão",
    cardExpiry: "Validade",
    cardCvv: "CVV",
    cardPreviewName: "Seu nome",
    cardPreviewExpiry: "MM/AA",
    securityNotice: "Seus dados são criptografados de ponta a ponta. Nunca armazenamos informações do cartão.",
    awaitingPayment: "Aguardando pagamento",
    totalAmount: "Valor total",
    copyPixCode: "Ou copie o código PIX:",
    copied: "Copiado!",
    copy: "Copiar",
    generateNewQr: "Gerar novo QR Code",
    amountIn: "Valor em",
    approximately: "Aproximadamente",
    selectNetwork: "Selecione a rede",
    walletAddress: "Endereço da carteira",
    copyAddress: "Copiar endereço",
    cryptoWarning: "Atenção: Envie apenas",
    payWithWallet: "Pague usando sua carteira digital preferida",
    payWith: "Pagar",
    processing: "Processando...",
    paymentConfirmed: "Pagamento confirmado!",
    selectToContinue: "Selecione um método de pagamento para continuar",
    language: "Idioma",
    currency: "Moeda",
  },
  "pt-PT": {
    loading: "A preparar o seu checkout...",
    loadingSteps: [
      "A carregar dados da loja...",
      "A verificar métodos de pagamento...",
      "A preparar ambiente seguro...",
      "Quase pronto...",
    ],
    secureCheckout: "Checkout seguro",
    dataProtected: "Dados protegidos",
    poweredBy: "Powered by",
    tryAgain: "Tentar novamente",
    errorTitle: "Algo correu mal",
    errorLoading: "Erro ao carregar checkout",
    paymentError: "Ocorreu um erro ao processar o pagamento. Tente novamente.",
    unknownError: "Erro desconhecido",
    subtotal: "Subtotal",
    taxes: "Impostos",
    discount: "Desconto",
    total: "Total",
    offerExpires: "Oferta expira em",
    offerUrgent: "Esta oferta expira em",
    minutesRemaining: "restantes",
    yourData: "Os seus dados",
    paymentMethod: "Método de pagamento",
    selectMethod: "Selecione um método",
    cardNumber: "Número do cartão",
    cardHolder: "Nome no cartão",
    cardExpiry: "Validade",
    cardCvv: "CVV",
    cardPreviewName: "O seu nome",
    cardPreviewExpiry: "MM/AA",
    securityNotice: "Os seus dados são encriptados de ponta a ponta. Nunca armazenamos informações do cartão.",
    awaitingPayment: "A aguardar pagamento",
    totalAmount: "Valor total",
    copyPixCode: "Ou copie o código PIX:",
    copied: "Copiado!",
    copy: "Copiar",
    generateNewQr: "Gerar novo QR Code",
    amountIn: "Valor em",
    approximately: "Aproximadamente",
    selectNetwork: "Selecione a rede",
    walletAddress: "Endereço da carteira",
    copyAddress: "Copiar endereço",
    cryptoWarning: "Atenção: Envie apenas",
    payWithWallet: "Pague usando a sua carteira digital preferida",
    payWith: "Pagar",
    processing: "A processar...",
    paymentConfirmed: "Pagamento confirmado!",
    selectToContinue: "Selecione um método de pagamento para continuar",
    language: "Idioma",
    currency: "Moeda",
  },
  en: {
    loading: "Preparing your checkout...",
    loadingSteps: [
      "Loading store data...",
      "Verifying payment methods...",
      "Preparing secure environment...",
      "Almost ready...",
    ],
    secureCheckout: "Secure checkout",
    dataProtected: "Data protected",
    poweredBy: "Powered by",
    tryAgain: "Try again",
    errorTitle: "Something went wrong",
    errorLoading: "Error loading checkout",
    paymentError: "An error occurred while processing the payment. Please try again.",
    unknownError: "Unknown error",
    subtotal: "Subtotal",
    taxes: "Taxes",
    discount: "Discount",
    total: "Total",
    offerExpires: "Offer expires in",
    offerUrgent: "This offer expires in",
    minutesRemaining: "remaining",
    yourData: "Your details",
    paymentMethod: "Payment method",
    selectMethod: "Select a method",
    cardNumber: "Card number",
    cardHolder: "Name on card",
    cardExpiry: "Expiry",
    cardCvv: "CVV",
    cardPreviewName: "Your name",
    cardPreviewExpiry: "MM/YY",
    securityNotice: "Your data is end-to-end encrypted. We never store card information.",
    awaitingPayment: "Awaiting payment",
    totalAmount: "Total amount",
    copyPixCode: "Or copy the PIX code:",
    copied: "Copied!",
    copy: "Copy",
    generateNewQr: "Generate new QR Code",
    amountIn: "Amount in",
    approximately: "Approximately",
    selectNetwork: "Select network",
    walletAddress: "Wallet address",
    copyAddress: "Copy address",
    cryptoWarning: "Warning: Send only",
    payWithWallet: "Pay using your preferred digital wallet",
    payWith: "Pay",
    processing: "Processing...",
    paymentConfirmed: "Payment confirmed!",
    selectToContinue: "Select a payment method to continue",
    language: "Language",
    currency: "Currency",
  },
  es: {
    loading: "Preparando tu checkout...",
    loadingSteps: [
      "Cargando datos de la tienda...",
      "Verificando métodos de pago...",
      "Preparando entorno seguro...",
      "Casi listo...",
    ],
    secureCheckout: "Checkout seguro",
    dataProtected: "Datos protegidos",
    poweredBy: "Powered by",
    tryAgain: "Intentar de nuevo",
    errorTitle: "Algo salió mal",
    errorLoading: "Error al cargar el checkout",
    paymentError: "Ocurrió un error al procesar el pago. Intenta de nuevo.",
    unknownError: "Error desconocido",
    subtotal: "Subtotal",
    taxes: "Impuestos",
    discount: "Descuento",
    total: "Total",
    offerExpires: "La oferta expira en",
    offerUrgent: "Esta oferta expira en",
    minutesRemaining: "restantes",
    yourData: "Tus datos",
    paymentMethod: "Método de pago",
    selectMethod: "Selecciona un método",
    cardNumber: "Número de tarjeta",
    cardHolder: "Nombre en la tarjeta",
    cardExpiry: "Vencimiento",
    cardCvv: "CVV",
    cardPreviewName: "Tu nombre",
    cardPreviewExpiry: "MM/AA",
    securityNotice: "Tus datos están encriptados de extremo a extremo. Nunca almacenamos información de la tarjeta.",
    awaitingPayment: "Esperando pago",
    totalAmount: "Monto total",
    copyPixCode: "O copia el código PIX:",
    copied: "¡Copiado!",
    copy: "Copiar",
    generateNewQr: "Generar nuevo QR Code",
    amountIn: "Monto en",
    approximately: "Aproximadamente",
    selectNetwork: "Selecciona la red",
    walletAddress: "Dirección de billetera",
    copyAddress: "Copiar dirección",
    cryptoWarning: "Atención: Envía solo",
    payWithWallet: "Paga usando tu billetera digital preferida",
    payWith: "Pagar",
    processing: "Procesando...",
    paymentConfirmed: "¡Pago confirmado!",
    selectToContinue: "Selecciona un método de pago para continuar",
    language: "Idioma",
    currency: "Moneda",
  },
};

export function getTranslations(locale: Locale): TranslationKeys {
  return translations[locale] ?? translations["en"];
}
