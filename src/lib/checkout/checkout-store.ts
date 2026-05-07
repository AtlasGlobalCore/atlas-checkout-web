// ─── Atlas Payment Router — Zustand Store ───────────────────────────────────

import { create } from "zustand";
import type { CheckoutState, PayerFormData, CheckoutStep, GatewayResponse } from "./types";
import { loadMercadoPagoSdk, createMercadoPagoInstance } from "./mp-loader";

const initialPayerData: PayerFormData = {
  fullName: "",
  email: "",
  phone: "",
  document: "",
  address: "",
  country: "",
};

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
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

  // Card form data
  paymentData: {},

  // Gateway (populated after POST /checkout/pay)
  transactionId: null,
  gatewayResponse: null,

  // Mercado Pago SDK
  mpInstance: null,
  mpReady: false,

  // ─── Actions ────────────────────────────────────────────────────────────

  setSession: (session) => set({ session, isLoading: false, step: "PAYER" }),
  setLoading: (isLoading) => set({ isLoading }),
  setStep: (step) => set({ step, error: null }),
  setError: (error) => set({ error, step: error ? "ERROR" : undefined as unknown as CheckoutStep }),

  updatePayerData: (field, value) =>
    set((state) => ({ payerData: { ...state.payerData, [field]: value } })),

  setPayerId: (payerId) => set({ payerId }),
  setRegistering: (isRegistering) => set({ isRegistering }),

  updatePaymentData: (data) =>
    set((state) => ({ paymentData: { ...state.paymentData, ...data } })),

  selectMethod: (id) => set({ selectedMethodId: id, error: null }),
  setProcessing: (isProcessing) => set({ isProcessing }),
  setPaymentStatus: (paymentStatus) => set({ paymentStatus }),

  setTransactionId: (transactionId) => set({ transactionId }),
  setGatewayResponse: (gatewayResponse) => set({ gatewayResponse }),
  clearGatewayResponse: () => set({ gatewayResponse: null, transactionId: null }),

  // ─── Mercado Pago SDK Initialization ────────────────────────────────────
  // Silently loads the SDK and creates an instance with the given publicKey.
  initMercadoPago: async (publicKey: string) => {
    // Already initialized with this key?
    if (get().mpReady && get().mpInstance) return;

    try {
      await loadMercadoPagoSdk();
      const instance = createMercadoPagoInstance(publicKey);

      if (instance) {
        set({ mpInstance: instance, mpReady: true });
      }
    } catch {
      set({ mpReady: false });
    }
  },

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
      paymentData: {},
      transactionId: null,
      gatewayResponse: null,
      mpInstance: null,
      mpReady: false,
    }),
}));
