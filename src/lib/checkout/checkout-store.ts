// ─── Atlas Payment Router — Zustand Store ───────────────────────────────────

import { create } from "zustand";
import type { CheckoutState, PayerFormData, CheckoutStep } from "./types";

const initialPayerData: PayerFormData = {
  fullName: "",
  email: "",
  phone: "",
  document: "",
  address: "",
  country: "",
};

export const useCheckoutStore = create<CheckoutState>((set) => ({
  session: null,
  isLoading: true,
  step: "LOADING",
  error: null,

  payerData: { ...initialPayerData },
  payerId: null,
  isRegistering: false,

  selectedMethodId: null,
  isProcessing: false,
  paymentStatus: null,

  setSession: (session) => set({ session, isLoading: false, step: "PAYER" }),
  setLoading: (isLoading) => set({ isLoading }),
  setStep: (step) => set({ step, error: null }),
  setError: (error) => set({ error, step: error ? "ERROR" : undefined as unknown as CheckoutStep }),

  updatePayerData: (field, value) =>
    set((state) => ({ payerData: { ...state.payerData, [field]: value } })),

  setPayerId: (payerId) => set({ payerId }),
  setRegistering: (isRegistering) => set({ isRegistering }),

  selectMethod: (id) => set({ selectedMethodId: id, error: null }),
  setProcessing: (isProcessing) => set({ isProcessing }),
  setPaymentStatus: (paymentStatus) => set({ paymentStatus }),

  reset: () =>
    set({
      session: null,
      isLoading: true,
      step: "LOADING",
      error: null,
      payerData: { ...initialPayerData },
      payerId: null,
      isRegistering: false,
      selectedMethodId: null,
      isProcessing: false,
      paymentStatus: null,
    }),
}));
