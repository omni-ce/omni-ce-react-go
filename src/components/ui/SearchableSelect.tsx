import React, { useState, useRef, useEffect, useMemo } from "react";
import { HiChevronDown, HiSearch, HiX } from "react-icons/hi";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function SearchableSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Choose...",
  disabled = false,
  loading = false,
  className,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const lowerSearch = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(lowerSearch) ||
        opt.value.toLowerCase().includes(lowerSearch)
    );
  }, [options, search]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <button
        type="button"
        id={id}
        disabled={disabled || loading}
        className={cn(
          "w-full px-4 py-2.5 bg-dark-900/60 border border-dark-500/50 rounded-xl text-foreground focus:outline-none focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30 transition-all text-sm disabled:opacity-50 flex items-center justify-between text-left",
          !selectedOption && "text-dark-300"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {loading
            ? "Loading..."
            : selectedOption
            ? selectedOption.label
            : placeholder}
        </span>
        {value && !disabled && !loading ? (
          <div className="flex items-center gap-1">
            <HiX
              className="w-4 h-4 text-dark-400 hover:text-dark-100 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
            />
            <HiChevronDown className="w-4 h-4 text-dark-400" />
          </div>
        ) : (
          <HiChevronDown className="w-4 h-4 text-dark-400" />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-[100] mt-1 w-full bg-dark-800 border border-dark-500/50 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-60">
          <div className="p-2 border-b border-dark-500/50 flex items-center gap-2 bg-dark-900/60">
            <HiSearch className="w-4 h-4 text-dark-400 shrink-0" />
            <input
              type="text"
              className="w-full bg-transparent border-none text-sm text-foreground focus:outline-none placeholder:text-dark-400"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto p-1 flex-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-center text-dark-400">
                No options found
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-dark-600 transition-colors",
                    value === opt.value ? "bg-accent-500/20 text-accent-400" : "text-foreground"
                  )}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
