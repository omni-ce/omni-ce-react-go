import countries from "@/countries";
import { useLanguageStore } from "@/stores/languageStore";
import * as flags from "country-flag-icons/react/3x2";
import { useState } from "react";

interface Props {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function PhoneNumber({ value = "", onChange, error, disabled = false }: Props) {
  const { languageCode } = useLanguageStore();

  // Find country by language code, fallback to ID (Indonesia)
  const defaultCountry =
    countries.find((c) => c.key === languageCode)?.code || "ID";

  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [isOpen, setIsOpen] = useState(false);

  const currentCountry = countries.find((c) => c.code === selectedCountry);
  const FlagComponent = currentCountry
    ? (
        flags as unknown as Record<
          string,
          React.ComponentType<{ className?: string }>
        >
      )[currentCountry.flag]
    : null;

  const handleCountrySelect = (code: string) => {
    setSelectedCountry(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        {/* Country Code Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className={`flex h-12.5 items-center gap-2 rounded-lg border px-3 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          >
            {FlagComponent && <FlagComponent className="h-4 w-6" />}
            <span className="text-sm font-medium">
              +{currentCountry?.phoneCode}
            </span>
            <svg
              className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute top-full left-0 z-50 mt-1 max-h-60 w-64 overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
              {countries.map((country) => {
                const Flag = (
                  flags as unknown as Record<
                    string,
                    React.ComponentType<{ className?: string }>
                  >
                )[country.flag];
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country.code)}
                    className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition hover:bg-gray-100 ${
                      selectedCountry === country.code ? "bg-blue-50" : ""
                    }`}
                  >
                    {Flag && <Flag className="h-4 w-6" />}
                    <span className="flex-1">{country.name}</span>
                    <span className="text-gray-500">+{country.phoneCode}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const numericValue = e.target.value.replace(/\D/g, "");
            onChange(numericValue);
          }}
          placeholder="Phone number"
          className={`flex-1 rounded-lg border px-4 py-3 transition outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />
      </div>

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
}
