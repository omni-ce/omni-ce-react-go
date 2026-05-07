import countries from "@/countries";
import { useLanguageStore } from "@/stores/languageStore";
import * as flags from "country-flag-icons/react/3x2";
import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { IconComponent } from "./IconSelector";

interface Props {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  phoneDefaultCountry?: string;
  phoneFirstAntiZero?: boolean;
}

export default function PhoneNumber({
  value = "",
  onChange,
  error,
  disabled = false,
  phoneDefaultCountry,
  phoneFirstAntiZero = false,
}: Props) {
  const { languageCode } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Find country by language code, fallback to ID (Indonesia)
  const defaultCountry = useMemo(() => {
    if (phoneDefaultCountry) {
      return (
        countries.find(
          (c) =>
            c.key === phoneDefaultCountry || c.code === phoneDefaultCountry,
        )?.code || "ID"
      );
    }
    return countries.find((c) => c.key === languageCode)?.code || "ID";
  }, [phoneDefaultCountry, languageCode]);

  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);

  // Update selected country if defaultCountry changes and user hasn't manually selected one yet
  useEffect(() => {
    setSelectedCountry(defaultCountry);
  }, [defaultCountry]);

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
    setSearch("");
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
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
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
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              "flex h-12.5 items-center gap-2 rounded-xl border px-3 transition-all outline-none focus:ring-1 focus:ring-accent-500/30 disabled:opacity-50",
              isOpen
                ? "border-accent-500/60 ring-1 ring-accent-500/30 bg-dark-800"
                : "border-dark-500/50 bg-dark-900/60 hover:bg-dark-800",
              error ? "border-neon-red/50" : "border-dark-500/50",
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

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute top-full left-0 z-100 mt-2 w-72 bg-dark-800 border border-dark-500/50 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-80 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
              <div className="p-2 border-b border-dark-500/50 flex items-center gap-2 bg-dark-900/60 sticky top-0 z-10">
                <IconComponent
                  iconName="Hi/HiSearch"
                  className="w-4 h-4 text-dark-400 shrink-0"
                />
                <input
                  type="text"
                  className="w-full bg-transparent border-none text-sm text-foreground focus:outline-none placeholder:text-dark-400"
                  placeholder={languageCode === "id" ? "Cari..." : "Search..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="overflow-y-auto p-1 scrollbar-hide">
                {filteredCountries.length === 0 ? (
                  <div className="p-4 text-center text-sm text-dark-400">
                    {languageCode === "id"
                      ? "Tidak ditemukan"
                      : "No results found"}
                  </div>
                ) : (
                  filteredCountries.map((country) => {
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
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-2 text-left text-sm rounded-lg transition-colors hover:bg-dark-600",
                          selectedCountry === country.code
                            ? "bg-accent-500/20 text-accent-400"
                            : "text-foreground",
                        )}
                      >
                        {Flag && (
                          <div className="h-3.5 w-5 shrink-0 overflow-hidden rounded-sm shadow-sm">
                            <Flag className="h-full w-full object-cover" />
                          </div>
                        )}
                        <span className="flex-1 truncate">{country.name}</span>
                        <span className="text-dark-400 text-xs font-mono">
                          +{country.phoneCode}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={value}
          disabled={disabled}
          onChange={(e) => {
            let numericValue = e.target.value.replace(/\D/g, "");
            if (phoneFirstAntiZero && numericValue.startsWith("0")) {
              numericValue = numericValue.replace(/^0+/, "");
            }
            onChange(numericValue);
          }}
          placeholder={languageCode === "id" ? "Nomor telepon" : "Phone number"}
          className={cn(
            "flex-1 px-4 py-3 bg-dark-900/60 border border-dark-500/50 rounded-xl text-foreground placeholder-dark-400 focus:outline-none focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30 transition-all font-mono text-sm disabled:opacity-50",
            error ? "border-neon-red/50" : "border-dark-500/50",
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
