import type { Metadata } from "next";
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
  title: "Atlas Checkout — Smart Payment",
  description:
    "Checkout seguro e inteligente. Pague com cartão, PIX ou criptomoeda.",
  keywords: [
    "Atlas",
    "Checkout",
    "Payment",
    "PIX",
    "Stripe",
    "Smart Checkout",
  ],
  authors: [{ name: "Atlas Global" }],
  openGraph: {
    title: "Atlas Checkout",
    description: "Checkout seguro e inteligente",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}
      >
        {children}
      </body>
    </html>
  );
}
