// ─── Crypto Payment Strategy ────────────────────────────────────────────────

"use client";

import { useState } from "react";
import { Bitcoin, Copy, Check, ArrowDown, Wallet, ExternalLink } from "lucide-react";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { useI18n } from "@/lib/i18n";

interface CryptoNetwork {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  address: string;
  explorerUrl: string;
  estimatedAmount: string;
  confirmations: number;
}

const CRYPTO_NETWORKS: CryptoNetwork[] = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC", icon: "bitcoin", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", explorerUrl: "https://blockchain.info/address/", estimatedAmount: "0.00043", confirmations: 3 },
  { id: "ethereum", name: "Ethereum", symbol: "ETH", icon: "ethereum", address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", explorerUrl: "https://etherscan.io/address/", estimatedAmount: "0.00782", confirmations: 12 },
  { id: "usdt", name: "Tether (USDT)", symbol: "USDT", icon: "usdt", address: "TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9", explorerUrl: "https://tronscan.org/#/address/", estimatedAmount: "5.15", confirmations: 20 },
];

const networkIcons: Record<string, React.ReactNode> = {
  bitcoin: <Bitcoin className="h-4 w-4 sm:h-5 sm:w-5" />,
  ethereum: (
    <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 256 417" fill="none">
      <path d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" fill="#8C8C8C" />
      <path d="M127.962 0L0 212.32l127.962 75.639V154.158z" fill="#ABABAB" />
      <path d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z" fill="#8C8C8C" />
      <path d="M127.962 416.905v-104.72L0 236.585z" fill="#ABABAB" />
    </svg>
  ),
  usdt: (
    <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#26A17B" />
      <path d="M17.922 17.383v-.003c-.116.008-.72.045-2.066.045-1.073 0-1.828-.033-2.095-.045v.003c-4.138-.183-7.226-.902-7.226-1.767 0-.866 3.088-1.585 7.226-1.768v2.815c.272.02 1.043.065 2.113.065 1.283 0 1.928-.053 2.048-.064v-2.814c4.131.183 7.213.902 7.213 1.767 0 .865-3.082 1.584-7.213 1.767zM17.922 13.387V10.85h5.735V7.193H8.533V10.85h5.735v2.536c-4.673.21-8.19 1.11-8.19 2.19 0 1.08 3.517 1.98 8.19 2.19v7.834h4.154v-7.835c4.665-.21 8.175-1.108 8.175-2.189 0-1.08-3.51-1.98-8.175-2.19z" fill="white" />
    </svg>
  ),
};

export function CryptoStrategy() {
  const [selectedNetwork, setSelectedNetwork] = useState<string>("bitcoin");
  const [copied, setCopied] = useState(false);

  const { session } = useCheckoutStore();
  const { t, formatAmount, currency } = useI18n();
  const total = session?.order.total ?? 0;

  const network = CRYPTO_NETWORKS.find((n) => n.id === selectedNetwork)!;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(network.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { setCopied(false); }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pt-1">
      {/* Amount */}
      <div className="text-center">
        <p className="text-xs sm:text-sm font-medium text-slate-500">{t.amountIn} {currency}</p>
        <p className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {formatAmount(total)}
        </p>
      </div>

      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 sm:gap-3 rounded-lg bg-slate-100 px-3 sm:px-4 py-2">
          <ArrowDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
          <div className="text-center">
            <p className="text-[10px] sm:text-xs text-slate-500">{t.approximately}</p>
            <p className="text-sm sm:text-base font-bold text-slate-900">
              {network.estimatedAmount} {network.symbol}
            </p>
          </div>
          <ArrowDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
        </div>
      </div>

      {/* Network Selection */}
      <div className="space-y-2">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">{t.selectNetwork}</p>
        <div className="grid gap-2">
          {CRYPTO_NETWORKS.map((net) => (
            <button
              key={net.id}
              type="button"
              onClick={() => { setSelectedNetwork(net.id); setCopied(false); }}
              className={`flex items-center gap-2.5 sm:gap-3 rounded-lg border px-3 sm:px-4 py-2.5 sm:py-3 text-left transition-all min-h-[48px] ${
                selectedNetwork === net.id
                  ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="shrink-0">{networkIcons[net.icon]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-slate-900">{net.name}</p>
                <p className="text-[10px] sm:text-xs text-slate-500">Confirmações: {net.confirmations}</p>
              </div>
              <span className="shrink-0 text-xs sm:text-sm font-mono font-semibold text-slate-700">{net.symbol}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">{t.walletAddress}</p>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:p-3">
          <code className="block break-all text-[10px] sm:text-xs font-mono text-slate-700 leading-relaxed">{network.address}</code>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium transition-all min-h-[44px] ${
              copied
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {copied ? (<><Check className="h-3.5 w-3.5" />{t.copied}</>) : (<><Copy className="h-3.5 w-3.5" />{t.copyAddress}</>)}
          </button>
          <a
            href={`${network.explorerUrl}${network.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all min-h-[44px]"
          >
            <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </a>
        </div>
      </div>

      {/* Warning */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 sm:px-4 py-2.5 sm:py-3">
        <p className="text-[10px] sm:text-xs leading-relaxed text-amber-800">
          <span className="font-semibold">{t.cryptoWarning}</span> <strong>{network.symbol}</strong> na rede <strong>{network.name}</strong>.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs text-slate-400">
        <Wallet className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        <span>{t.payWithWallet}</span>
      </div>
    </div>
  );
}
