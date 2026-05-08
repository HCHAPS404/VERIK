import { create } from "zustand";

import type { VerifyModel, VerifyStreamEvent } from "@/modules/verify/types";

type VerifyState = {
  loading: boolean;
  progress: number;
  error: string | null;
  model: VerifyModel | null;
  events: VerifyStreamEvent[];
  setLoading: (loading: boolean) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  setModel: (model: VerifyModel | null) => void;
  pushEvent: (event: VerifyStreamEvent) => void;
  reset: () => void;
};

const initialState = {
  loading: false,
  progress: 0,
  error: null,
  model: null,
  events: [] as VerifyStreamEvent[]
};

export const useVerifyStore = create<VerifyState>((set) => ({
  ...initialState,
  setLoading: (loading) => set({ loading }),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error }),
  setModel: (model) => set({ model }),
  pushEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  reset: () => set(initialState)
}));
