import { countries } from "@/world";
import { useLanguageStore } from "@/stores/languageStore";
import * as flags from "country-flag-icons/react/3x2";
import { useState, useRef, useEffect, useMemo, type ElementType } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { IconComponent } from "./IconSelector";
import { LanguageKey } from "@/types/world";

interface Props {
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  phoneDefaultCountry?: string;
  phoneFirstAntiZero?: boolean;
  maxLength?: number;
}

export default function PhoneNumber({
  value = "",
  onChange,
  onBlur,
  error,
  disabled = false,
  phoneDefaultCountry,
  phoneFirstAntiZero = false,
  maxLength,
}: Props) {
  const { languageCode } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  // Find country by language code, fallback to ID (Indonesia)
  const defaultCountry = useMemo(() => {
    if (phoneDefaultCountry) {
      return (
        countries.find(
          (c) =>
            (c.language_key as unknown as string) === phoneDefaultCountry ||
            c.code === phoneDefaultCountry,
        )?.code ?? "ID"
      );
    }
    return countries.find((c) => c.language_key === languageCode)?.code ?? "ID";
  }, [phoneDefaultCountry, languageCode]);

  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);

  // Split value into code and number
  const { codePart, numberPart } = useMemo(() => {
    if (!value) return { codePart: "", numberPart: "" };
    const parts = value.split(" ");
    if (parts.length < 2) return { codePart: "", numberPart: value };
    return { codePart: parts[0].replace("+", ""), numberPart: parts[1] };
  }, [value]);

  // Update selected country based on the value string (for initial load/edit)
  useEffect(() => {
    if (codePart) {
      const country = countries.find((c) => String(c.phoneCode) === codePart);
      if (country) {
        setSelectedCountry(country.code);
      }
    } else if (value && !value.includes(" ")) {
      // If value exists but has no space (no country code),
      // we should probably add the current country's code
      const country = countries.find((c) => c.code === selectedCountry);
      if (country) {
        onChange(`+${country.phoneCode} ${value}`);
      }
    }
  }, [codePart, value, selectedCountry, onChange]);

  const currentCountry = countries.find((c) => c.code === selectedCountry);
  const FlagComponent = currentCountry
    ? (
        flags as unknown as Record<
          string,
          React.ComponentType<{ className?: string }>
        >
      )[currentCountry.flag]
    : null;

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setIsOpen(false);
    setSearch("");

    // Update full value with new country code
    const country = countries.find((c) => c.code === countryCode);
    if (country) {
      onChange(`+${country.phoneCode} ${numberPart}`);
    }
  };

  const filteredCountries = useMemo(() => {
    if (!search) return countries;
    const lowerSearch = search.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerSearch) ||
        String(c.phoneCode).includes(search),
    );
  }, [search]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 8, // 8px for mt-2 spacing
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 288), // min width 72 (288px)
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      // Allow click if it's inside the container (input/button)
      if (containerRef.current?.contains(event.target as Node)) {
        return;
      }
      // Also close if click is outside the portal dropdown
      const portal = document.getElementById("phone-dropdown-portal");
      if (portal?.contains(event.target as Node)) {
        return;
      }
      setIsOpen(false);
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex gap-2 mt-1.5">
        {/* Country Code Dropdown */}
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              "flex h-12.5 items-center gap-2 rounded-xl border px-3 transition-all outline-none focus:ring-1 focus:ring-accent-500/30 disabled:opacity-50",
              isOpen
                ? "border-accent-500/60 ring-1 ring-accent-500/30 bg-dark-800"
                : "border-dark-600 bg-dark-900 hover:bg-dark-800",
              error ? "border-neon-red/50" : "border-dark-600",
            )}
          >
            {FlagComponent && (
              <div className="h-4 w-6 overflow-hidden rounded-sm shadow-sm">
                <FlagComponent className="h-full w-full object-cover" />
              </div>
            )}
            <span className="text-sm font-medium text-foreground">
              +{currentCountry?.phoneCode}
            </span>
            <IconComponent
              iconName="Hi/HiChevronDown"
              className={cn(
                "w-4 h-4 text-dark-400 transition-transform duration-200",
                isOpen && "rotate-180",
              )}
            />
          </button>

          {/* Dropdown Menu Portal */}
          {isOpen &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                id="phone-dropdown-portal"
                className="absolute z-[1000] bg-dark-800 border border-dark-600 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-80"
                style={{
                  top: `${dropdownPos.top}px`,
                  left: `${dropdownPos.left}px`,
                  width: `${dropdownPos.width}px`,
                }}
              >
                <div className="p-2 border-b border-dark-600 flex items-center gap-2 bg-dark-900 sticky top-0 z-10">
                  <IconComponent
                    iconName="Hi/HiSearch"
                    className="w-4 h-4 text-dark-400 shrink-0"
                  />
                  <input
                    type="text"
                    className="w-full bg-transparent border-none text-sm text-foreground focus:outline-none placeholder:text-dark-400"
                    placeholder={
                      languageCode === LanguageKey.ID ? "Cari..." : "Search..."
                    }
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto p-1 scrollbar-hide">
                  {filteredCountries.length === 0 ? (
                    <div className="p-4 text-center text-sm text-dark-400">
                      {languageCode === LanguageKey.ID
                        ? "Tidak ditemukan"
                        : "No results found"}
                    </div>
                  ) : (
                    filteredCountries.map((country) => {
                      const Flag = (
                        flags as unknown as Record<
                          string,
                          | React.ComponentType<{ className?: string }>
                          | undefined
                        >
                      )[country.flag] as ElementType;
                      return (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => handleCountrySelect(country.code)}
                          className={cn(
                            "flex w-full items-center gap-3 px-3 py-2 text-left text-sm rounded-lg transition-colors hover:bg-dark-700",
                            selectedCountry === country.code
                              ? "bg-accent-500/20 text-accent-500"
                              : "text-foreground",
                          )}
                        >
                          <div className="h-3.5 w-5 shrink-0 overflow-hidden rounded-sm shadow-sm">
                            <Flag className="h-full w-full object-cover" />
                          </div>
                          <span className="flex-1 truncate">
                            {country.name}
                          </span>
                          <span className="text-dark-400 text-xs">
                            +{country.phoneCode}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>,
              document.body,
            )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={numberPart}
          disabled={disabled}
          onChange={(e) => {
            let numericValue = e.target.value.replace(/[^0-9]/g, "");

            // Apply maxLength limiter
            if (maxLength && numericValue.length > maxLength) {
              numericValue = numericValue.slice(0, maxLength);
            }

            if (phoneFirstAntiZero && numericValue.startsWith("0")) {
              numericValue = numericValue.substring(1);
            }
            const phoneCode = currentCountry?.phoneCode ?? "62";
            onChange(`+${phoneCode} ${numericValue}`);
          }}
          onBlur={onBlur}
          maxLength={maxLength}
          placeholder={
            languageCode === LanguageKey.ID ? "Nomor telepon" : "Phone number"
          }
          className={cn(
            "flex-1 px-4 py-3 bg-dark-900 border border-dark-600 rounded-xl text-foreground placeholder-dark-400 focus:outline-none focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30 transition-all text-sm disabled:opacity-50",
            error ? "border-neon-red/50" : "border-dark-600",
          )}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-xs text-neon-red font-medium pl-1">{error}</p>
      )}
    </div>
  );
}
