import { create } from "zustand";

type UiState = {
  locale: "es";
  setLocale: (locale: "es") => void;
};

export const useUiStore = create<UiState>((set) => ({
  locale: "es",
  setLocale: (locale) => set({ locale })
}));
