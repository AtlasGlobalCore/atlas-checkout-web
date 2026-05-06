// ─── Checkout Zustand Store ──────────────────────────────────────────────────

import { create } from "zustand";
import type { CheckoutState, PayerFormData } from "./types";

const initialPayerData: PayerFormData = {
  fullName: "",
  email: "",
  phone: "",
  cpf: "",
  cnpj: "",
  nif: "",
  address: "",
  country: "",
};

export const useCheckoutStore = create<CheckoutState>((set) => ({
  session: null,
  isLoading: true,
  isProcessing: false,
  selectedMethodId: null,
  payerData: { ...initialPayerData },
  paymentData: {},
  error: null,

  setSession: (session) => set({ session, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  setProcessing: (processing) => set({ isProcessing: processing }),
  selectMethod: (methodId) => set({ selectedMethodId: methodId, error: null }),

  updatePayerData: (field, value) =>
    set((state) => ({
      payerData: { ...state.payerData, [field]: value },
    })),

  updatePaymentData: (data) =>
    set((state) => ({
      paymentData: { ...state.paymentData, ...data },
    })),

  setError: (error) => set({ error }),

  reset: () =>
    set({
      session: null,
      isLoading: true,
      isProcessing: false,
      selectedMethodId: null,
      payerData: { ...initialPayerData },
      paymentData: {},
      error: null,
    }),
}));
