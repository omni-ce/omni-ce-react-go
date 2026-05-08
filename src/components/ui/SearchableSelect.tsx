import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { IconComponent } from "./IconSelector";

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
  onOpen?: () => void;
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
  onOpen,
  className,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4, // 4px for mt-1 spacing
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        containerRef.current.contains(event.target as Node)
      ) {
        return;
      }
      const portal = document.getElementById("searchable-select-portal");
      if (portal && portal.contains(event.target as Node)) {
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
        opt.value.toLowerCase().includes(lowerSearch),
    );
  }, [options, search]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        id={id}
        disabled={disabled || loading}
        className={cn(
          "w-full px-4 py-2.5 bg-dark-900/60 border border-dark-500/50 rounded-xl text-foreground focus:outline-none focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30 transition-all text-sm disabled:opacity-50 flex items-center justify-between text-left",
          !selectedOption && "text-dark-300",
        )}
        onClick={() => {
          if (!isOpen && onOpen) onOpen();
          setIsOpen(!isOpen);
        }}
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
            <IconComponent
              iconName="Hi/HiX"
              className="w-4 h-4 text-dark-400 hover:text-dark-100 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
            />
            <IconComponent
              iconName="Hi/HiChevronDown"
              className="w-4 h-4 text-dark-400"
            />
          </div>
        ) : (
          <IconComponent
            iconName="Hi/HiChevronDown"
            className="w-4 h-4 text-dark-400"
          />
        )}
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id="searchable-select-portal"
            className="absolute z-1000 bg-dark-800 border border-dark-500/50 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-60"
            style={{
              top: `${dropdownPos.top}px`,
              left: `${dropdownPos.left}px`,
              width: `${dropdownPos.width}px`,
            }}
          >
            <div className="p-2 border-b border-dark-500/50 flex items-center gap-2 bg-dark-900/60">
              <IconComponent
                iconName="Hi/HiSearch"
                className="w-4 h-4 text-dark-400 shrink-0"
              />
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
                      value === opt.value
                        ? "bg-accent-500/20 text-accent-400"
                        : "text-foreground",
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
          </div>,
          document.body,
        )}
    </div>
  );
}
