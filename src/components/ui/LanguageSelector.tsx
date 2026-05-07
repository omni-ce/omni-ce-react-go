import * as flags from "country-flag-icons/react/3x2";
import { Fragment, useState } from "react";
import { useLocation, useParams } from "react-router";
import { useThemeStore } from "@/stores/themeStore";
import { SUPPORTED_LANGUAGES, useLanguageStore } from "@/stores/languageStore";

export interface Language {
  id: string;
  name: string;
  key: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

interface Props {
  className?: string;
}

export default function LanguageSelector({ className = "" }: Props) {
  const { route } = useParams();
  const location = useLocation();

  const { isDarkMode } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();

  const [isLoadingLanguage, setLoadingLanguage] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null,
  );

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang.key);
    setShowDropdown(false);
  };

  if (languages.length === 0) return null;

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
        {selectedLanguage && (
          <Fragment>
            {(() => {
              const FlagComponent = (flags as any)[
                selectedLanguage.key.toUpperCase()
              ];
              return FlagComponent ? (
                <FlagComponent className="h-4 w-6" />
              ) : (
                <span className="text-sm">🌐</span>
              );
            })()}
            <span className="text-sm font-medium">
              {selectedLanguage.key.toUpperCase()}
            </span>
          </Fragment>
        )}
      </button>

      {showDropdown && (
        <div
          className={`absolute top-full right-0 z-50 min-w-40 rounded-lg border py-2 shadow-lg ${
            isDarkMode
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const FlagComponent = (flags as any)[lang.key.toUpperCase()];
            return (
              <button
                key={lang.id}
                onClick={() => handleLanguageChange(lang)}
                className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${
                  selectedLanguage?.id === lang.id
                    ? "bg-blue-50"
                    : isDarkMode
                      ? "text-white hover:bg-gray-700"
                      : "hover:bg-gray-100"
                }`}
              >
                {FlagComponent ? (
                  <FlagComponent className="h-4 w-6" />
                ) : (
                  <span className="text-sm">🌐</span>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {lang.key.toUpperCase()}
                  </span>
                  <span
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {lang.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
