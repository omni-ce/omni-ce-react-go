import * as flags from "country-flag-icons/react/3x2";
import { useState } from "react";
import { useThemeStore } from "@/stores/themeStore";
import { SUPPORTED_LANGUAGES, useLanguageStore } from "@/stores/languageStore";
import { IconComponent } from "@/components/ui/IconSelector";
import { arrayLanguages } from "@/world";
import { LanguageKey } from "@/types/world";

interface Props {
  className?: string;
}

export default function LanguageSelector({ className = "" }: Props) {
  const { isDarkMode } = useThemeStore();
  const { languageCode, setLanguage, toggleLanguage, language } =
    useLanguageStore();

  const [showDropdown, setShowDropdown] = useState(false);

  const getCountryForLanguage = (langKey: string) => {
    return arrayLanguages.find((c) => c.key === langKey);
  };

  const currentCountry = getCountryForLanguage(languageCode);

  if (SUPPORTED_LANGUAGES.length <= 2) {
    return (
      <button
        onClick={toggleLanguage}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-dark-300 hover:text-foreground hover:bg-dark-700/50 rounded-lg transition-all ${className}`}
        title={language({
          id: "Ganti bahasa",
          en: "Switch language",
        })}
      >
        {(() => {
          const FlagComponent = currentCountry
            ? (
                flags as unknown as Record<
                  string,
                  React.ComponentType<{ className?: string }>
                >
              )[currentCountry.flag]
            : null;
          return FlagComponent ? (
            <FlagComponent className="h-3.5 w-5 rounded-xs" />
          ) : (
            <IconComponent iconName="Ri/RiTranslate2" className="w-3.5 h-3.5" />
          );
        })()}
        <span className="uppercase">{languageCode}</span>
      </button>
    );
  }

  return (
    <div
      className={`language-selector relative ${className}`}
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)}
    >
      <button
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
          isDarkMode
            ? "border-gray-600 bg-gray-800 text-gray-100 hover:bg-gray-700"
            : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
        }`}
      >
        {(() => {
          const FlagComponent = currentCountry
            ? (
                flags as unknown as Record<
                  string,
                  React.ComponentType<{ className?: string }>
                >
              )[currentCountry.flag]
            : null;
          return FlagComponent ? (
            <FlagComponent className="h-4 w-6" />
          ) : (
            <span className="text-sm">🌐</span>
          );
        })()}
        <span className="text-sm font-medium">
          {languageCode.toUpperCase()}
        </span>
      </button>

      {showDropdown && (
        <div
          className={`absolute top-full right-0 z-50 min-w-40 rounded-lg border py-2 shadow-lg ${
            isDarkMode
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          {SUPPORTED_LANGUAGES.map((langKey) => {
            const country = getCountryForLanguage(langKey);
            const FlagComponent = country
              ? (
                  flags as unknown as Record<
                    string,
                    React.ComponentType<{ className?: string }>
                  >
                )[country.flag]
              : null;
            return (
              <button
                key={langKey}
                onClick={() => {
                  setLanguage(langKey);
                  setShowDropdown(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${
                  languageCode === langKey
                    ? "bg-blue-50 text-blue-700"
                    : isDarkMode
                      ? "text-white hover:bg-gray-700"
                      : "text-gray-800 hover:bg-gray-100"
                }`}
              >
                {FlagComponent ? (
                  <FlagComponent className="h-4 w-6" />
                ) : (
                  <span className="text-sm">🌐</span>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {langKey.toUpperCase()}
                  </span>
                  {country && (
                    <span
                      className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {country.name}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
