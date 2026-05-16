import { LanguageKey } from "@/types/world";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const SUPPORTED_LANGUAGES = [
  LanguageKey.ID,
  LanguageKey.EN,
  // LanguageKey.AR,
] as const;
export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];

interface LanguageState {
  languageCode: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  toggleLanguage: () => void;
  language: (t: Record<LanguageCode, string>) => string;
  rawLanguageToString: (t: string | undefined) => string;
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
      language: (textMap) => textMap[get().languageCode],
      rawLanguageToString: (text: string | undefined) => {
        try {
          if (typeof text === "string" && text.startsWith("{")) {
            const obj = JSON.parse(text) as Record<LanguageCode, string>;
            return get().language(obj);
          }
        } catch (e) {
          // fallback to raw name
        }
        return text ?? "";
      },
    }),
    {
      name: "app-language",
    },
  ),
);
