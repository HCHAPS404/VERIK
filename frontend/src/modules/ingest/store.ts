import { create } from "zustand";

import type { IngestModel } from "@/modules/ingest/types";

type IngestState = {
  loading: boolean;
  error: string | null;
  result: IngestModel | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setResult: (result: IngestModel | null) => void;
};

export const useIngestStore = create<IngestState>((set) => ({
  loading: false,
  error: null,
  result: null,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setResult: (result) => set({ result })
}));
