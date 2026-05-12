import { countries } from "@/world";
import * as flags from "country-flag-icons/react/3x2";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaSearch } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { IconComponent } from "./IconSelector";
import { useLanguageStore } from "@/stores/languageStore";

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  hideSelected?: boolean;
  disabled?: boolean;
}

export default function CountrySelector({
  value,
  onChange,
  label,
  hideSelected = false,
  disabled = false,
}: Props) {
  const { language } = useLanguageStore();

  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 8, // 8px for mt-2 spacing
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [showDropdown]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) {
        return;
      }
      const portal = document.getElementById("country-dropdown-portal");
      if (portal?.contains(event.target as Node)) {
        return;
      }
      setShowDropdown(false);
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [showDropdown]);

  useEffect(() => {
    if (!showDropdown) {
      setSearchQuery("");
    }
  }, [showDropdown]);

  const selectedCountry = countries.find((c) => c.code === value);

  const handleSelect = (country: (typeof countries)[0]) => {
    onChange(country.code);
    setShowDropdown(false);
  };

  const filteredCountries = countries.filter((country) => {
    const matchesSearch = country.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const isNotSelected = hideSelected ? country.code !== value : true;
    return matchesSearch && isNotSelected;
  });

  return (
    <div className="relative mt-1.5" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border px-4 py-2.5 transition-all outline-none focus:ring-1 focus:ring-accent-500/30 disabled:opacity-50",
          showDropdown
            ? "border-accent-500/60 ring-1 ring-accent-500/30 bg-dark-800"
            : "border-dark-600 bg-dark-900 hover:bg-dark-800",
        )}
      >
        {selectedCountry ? (
          <div className="flex items-center gap-2">
            {flags[selectedCountry.flag] && (
              <div className="h-4 w-6 overflow-hidden rounded-sm shadow-sm">
                {(() => {
                  const FlagComponent = flags[selectedCountry.flag];
                  return (
                    <FlagComponent className="h-full w-full object-cover" />
                  );
                })()}
              </div>
            )}
            <span className="text-sm text-foreground">
              {selectedCountry.name}
            </span>
          </div>
        ) : (
          <span className="text-sm text-dark-400">
            {language({
              id: `Pilih ${label}...`,
              en: `Select a ${label}...`,
            })}
          </span>
        )}
        <IconComponent
          iconName="Hi/HiChevronDown"
          className={cn(
            "w-4 h-4 text-dark-400 transition-transform duration-200",
            showDropdown && "rotate-180",
          )}
        />
      </button>

      {showDropdown &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id="country-dropdown-portal"
            className="absolute z-1000 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-80"
            style={{
              top: `${dropdownPos.top}px`,
              left: `${dropdownPos.left}px`,
              width: `${dropdownPos.width}px`,
            }}
          >
            {/* Search Input */}
            <div className="p-2 border-b border-dark-600 flex items-center gap-2 bg-dark-900 sticky top-0 z-10">
              <FaSearch className="text-xs text-dark-400 shrink-0 ml-1" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country..."
                className="w-full bg-transparent border-none text-sm text-foreground focus:outline-none placeholder:text-dark-400 py-1"
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              />
            </div>

            {/* Country List */}
            <div className="overflow-y-auto p-1 scrollbar-hide">
              {filteredCountries.length === 0 ? (
                <div className="p-4 text-center text-sm text-dark-400">
                  No results found
                </div>
              ) : (
                filteredCountries.map((country) => {
                  const FlagComponent = flags[country.flag];
                  return (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleSelect(country)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2 text-left text-sm rounded-lg transition-colors hover:bg-dark-700",
                        value === country.code
                          ? "bg-accent-500/20 text-accent-500"
                          : "text-foreground",
                      )}
                    >
                      <div className="h-3.5 w-5 shrink-0 overflow-hidden rounded-sm shadow-sm">
                        <FlagComponent className="h-full w-full object-cover" />
                      </div>
                      <span className="flex-1 truncate">{country.name}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
