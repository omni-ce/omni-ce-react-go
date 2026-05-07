import { CountryKey } from "@/types/language";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const SUPPORTED_LANGUAGES = [
  CountryKey.ID,
  CountryKey.EN,
  // CountryKey.AR,
] as const;
export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];

interface LanguageState {
  languageCode: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  toggleLanguage: () => void;
  language: (t: Record<LanguageCode, string>) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      languageCode: SUPPORTED_LANGUAGES[0], // default to first language
      setLanguage: (code) => set({ languageCode: code }),
      toggleLanguage: () =>
        set((state) => {
          const currentIndex = SUPPORTED_LANGUAGES.indexOf(state.languageCode);
          const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
          return { languageCode: SUPPORTED_LANGUAGES[nextIndex] };
        }),
      language: (textMap) =>
        textMap[get().languageCode] ?? textMap[SUPPORTED_LANGUAGES[0]], // default to first language
    }),
    {
      name: "ketring-language",
    },
  ),
);
