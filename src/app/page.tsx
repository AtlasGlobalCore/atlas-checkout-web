// ─── Atlas Checkout — Main Page ─────────────────────────────────────────────
// This is the entry point for the Smart Checkout.
// In production, this would be at app/[storeSlug]/[linkId]/page.tsx

import { CheckoutPage } from "@/components/checkout";

export default function Page() {
  return <CheckoutPage />;
}
