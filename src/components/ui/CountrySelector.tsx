import countries from "@/countries";
import * as flags from "country-flag-icons/react/3x2";
import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";

import { useThemeStore } from "@/stores/themeStore";

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  hideSelected?: boolean;
  disabled?: boolean;
}

export default function CountrySelector({
  value,
  onChange,
  label = "Country",
  required = false,
  placeholder = "Select a country",
  hideSelected = false,
  disabled = false,
}: Props) {
  const { isDarkMode } = useThemeStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showDropdown && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showDropdown]);

  const selectedCountry = countries.find((c) => c.code === value);

  const handleSelect = (country: (typeof countries)[0]) => {
    onChange(country.code);
    setShowDropdown(false);
    setSearchQuery("");
  };

  const filteredCountries = countries.filter((country) => {
    const matchesSearch = country.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const isNotSelected = hideSelected ? country.code !== value : true;
    return matchesSearch && isNotSelected;
  });

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={disabled}
        className={`flex w-full items-center justify-between rounded-lg border px-4 py-2 ${
          isDarkMode
            ? "border-gray-600 bg-gray-700 text-white"
            : "border-gray-300 bg-white text-gray-900"
        } focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
      >
        {selectedCountry ? (
          <div className="flex items-center gap-2">
            {flags[selectedCountry.flag] && (
              <div className="h-5 w-7 overflow-hidden rounded shadow-sm">
                {(() => {
                  const FlagComponent = flags[selectedCountry.flag];
                  return (
                    <FlagComponent className="h-full w-full object-cover" />
                  );
                })()}
              </div>
            )}
            <span>{selectedCountry.name}</span>
          </div>
        ) : (
          <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
            {placeholder}
          </span>
        )}
        <FaChevronDown
          className={`text-sm transition-transform ${showDropdown ? "rotate-180" : ""}`}
        />
      </button>
      {showDropdown && (
        <div
          className={`absolute z-10 mt-1 w-full rounded-lg border shadow-lg ${
            isDarkMode
              ? "border-gray-600 bg-gray-700"
              : "border-gray-300 bg-white"
          }`}
        >
          {/* Search Input */}
          <div className="${ isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white' } sticky top-0 border-b p-2">
            <div className="relative">
              <FaSearch
                className={`absolute top-1/2 left-3 -translate-y-1/2 text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country..."
                className={`w-full rounded-lg border py-2 pr-3 pl-9 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-600 text-white placeholder-gray-400"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                }`}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Country List */}
          <div className="max-h-60 overflow-auto">
            {filteredCountries.length === 0 ? (
              <div
                className={`px-4 py-8 text-center text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No countries found
              </div>
            ) : (
              filteredCountries.map((country) => {
                const FlagComponent = flags[country.flag];
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelect(country)}
                    className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${
                      value === country.code
                        ? isDarkMode
                          ? "bg-blue-900/30 text-blue-400"
                          : "bg-blue-50 text-blue-600"
                        : isDarkMode
                          ? "text-gray-300 hover:bg-gray-600"
                          : "text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <div className="h-5 w-7 shrink-0 overflow-hidden rounded shadow-sm">
                      <FlagComponent className="h-full w-full object-cover" />
                    </div>
                    <span>{country.name}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
