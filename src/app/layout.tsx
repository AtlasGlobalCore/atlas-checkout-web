import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atlas Checkout — Secure Smart Payment",
  description:
    "Pagamento seguro e inteligente. Checkout protegido com encriptação de ponta a ponta. Pague com cartão, PIX, MB WAY, SEPA, Viva Wallet ou criptomoeda.",
  keywords: [
    "Atlas",
    "Checkout",
    "Payment",
    "Secure Checkout",
    "PIX",
    "MB WAY",
    "SEPA",
    "Stripe",
    "Viva Wallet",
    "Smart Payment",
    "Safe Payment",
    "Criptomoeda",
  ],
  authors: [{ name: "Atlas Global" }],
  icons: {
    icon: "/store-logo.svg",
  },
  openGraph: {
    title: "Atlas Checkout — Secure Smart Payment",
    description: "Pagamento seguro e inteligente. Encriptação de ponta a ponta.",
    type: "website",
    siteName: "Atlas Checkout",
  },
  twitter: {
    card: "summary",
    title: "Atlas Checkout — Secure Smart Payment",
    description: "Pagamento seguro com encriptação de ponta a ponta.",
  },
  robots: {
    index: true,
    follow: true,
  },
  // Security-related metadata
  referrer: "strict-origin-when-cross-origin",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Security indicators for browser */}
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <link rel="icon" href="/store-logo.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}
      >
        {children}
      </body>
    </html>
  );
}
