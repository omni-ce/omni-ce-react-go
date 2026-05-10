import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import type { IconType } from "react-icons";
import { FaSearch } from "react-icons/fa";
import { HiChevronDown } from "react-icons/hi";
import { cn } from "@/lib/utils";

// Lazy load icon libraries
const iconLibraries: Record<string, () => Promise<unknown>> = {
  Ai: () => import("react-icons/ai"),
  Bi: () => import("react-icons/bi"),
  Bs: () => import("react-icons/bs"),
  Cg: () => import("react-icons/cg"),
  Ci: () => import("react-icons/ci"),
  Di: () => import("react-icons/di"),
  Fa: () => import("react-icons/fa"),
  Fa6: () => import("react-icons/fa6"),
  Fc: () => import("react-icons/fc"),
  Fi: () => import("react-icons/fi"),
  Go: () => import("react-icons/go"),
  Gr: () => import("react-icons/gr"),
  Hi: () => import("react-icons/hi"),
  Hi2: () => import("react-icons/hi2"),
  Im: () => import("react-icons/im"),
  Io: () => import("react-icons/io"),
  Io5: () => import("react-icons/io5"),
  Lia: () => import("react-icons/lia"),
  Lu: () => import("react-icons/lu"),
  Md: () => import("react-icons/md"),
  Pi: () => import("react-icons/pi"),
  Ri: () => import("react-icons/ri"),
  Rx: () => import("react-icons/rx"),
  Si: () => import("react-icons/si"),
  Sl: () => import("react-icons/sl"),
  Tb: () => import("react-icons/tb"),
  Tfi: () => import("react-icons/tfi"),
  Ti: () => import("react-icons/ti"),
  Vsc: () => import("react-icons/vsc"),
  Wi: () => import("react-icons/wi"),
};

// Cache for loaded icon libraries
const loadedLibraries: Record<string, Record<string, IconType>> = {};

export const options = [
  { name: "Ant Design", key: "Ai" },
  { name: "Bootstrap", key: "Bs" },
  { name: "BoxIcons", key: "Bi" },
  { name: "css.gg", key: "Cg" },
  { name: "Circum Icons", key: "Ci" },
  { name: "Devicons", key: "Di" },
  { name: "Font Awesome", key: "Fa" },
  { name: "Font Awesome 6", key: "Fa6" },
  { name: "Flat Color Icons", key: "Fc" },
  { name: "Feather", key: "Fi" },
  { name: "Github Octicons", key: "Go" },
  { name: "Grommet Icons", key: "Gr" },
  { name: "Heroicons", key: "Hi" },
  { name: "Heroicons 2", key: "Hi2" },
  { name: "IcoMoon Free", key: "Im" },
  { name: "Ionicons 4", key: "Io" },
  { name: "Ionicons 5", key: "Io5" },
  { name: "Icons8 Line Awesome", key: "Lia" },
  { name: "Lucide", key: "Lu" },
  { name: "Material Design", key: "Md" },
  { name: "Phosphor", key: "Pi" },
  { name: "Remix Icon", key: "Ri" },
  { name: "Radix UI", key: "Rx" },
  { name: "Simple Icons", key: "Si" },
  { name: "Simple Line Icons", key: "Sl" },
  { name: "Tabler Icons", key: "Tb" },
  { name: "Themify Icons", key: "Tfi" },
  { name: "Typicons", key: "Ti" },
  { name: "VS Code Icons", key: "Vsc" },
  { name: "Weather Icons", key: "Wi" },
];

// Helper function to load icon library
async function loadIconLibrary(key: string) {
  if (loadedLibraries[key]) return loadedLibraries[key];
  const loader = iconLibraries[key];
  if (loader) {
    const library = (await loader()) as Record<string, IconType>;
    loadedLibraries[key] = library;
    return library;
  }
  return null;
}

interface IconComponentProps extends React.SVGProps<SVGSVGElement> {
  iconName: string;
  size?: number;
}

export const IconComponent = ({ iconName, ...props }: IconComponentProps) => {
  const [IconSelected, setIconSelected] = useState<IconType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!iconName) {
      setIsLoading(false);
      return;
    }
    const parts = iconName.split("/");
    if (parts.length !== 2) {
      setIsLoading(false);
      return;
    }
    const [provider, code] = parts;
    loadIconLibrary(provider)
      .then((library) => {
        if (library && code && library[code]) {
          setIconSelected(() => library[code] as IconType);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [iconName]);

  if (isLoading) {
    return (
      <div
        className={cn("animate-pulse rounded bg-dark-700", props.className)}
        style={{ width: "1em", height: "1em" }}
      />
    );
  }

  if (!IconSelected) {
    return (
      <div
        className={cn("rounded border border-dark-600", props.className)}
        style={{ width: "1em", height: "1em" }}
      />
    );
  }

  return <IconSelected {...props} />;
};

interface Props {
  value: string;
  onChange: (iconName: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function IconSelector({
  value,
  onChange,
  placeholder = "Select an icon",
  disabled = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLibrary, setSelectedLibrary] = useState<string>("");
  const [loadedIcons, setLoadedIcons] = useState<
    Record<string, Record<string, IconType>>
  >({});
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      const portal = document.getElementById("icon-dropdown-portal");
      if (portal?.contains(event.target as Node)) return;
      setIsOpen(false);
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
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
    if (selectedLibrary && !loadedIcons[selectedLibrary]) {
      setIsLoadingLibrary(true);
      loadIconLibrary(selectedLibrary)
        .then((library) => {
          if (library) {
            setLoadedIcons((prev) => ({ ...prev, [selectedLibrary]: library }));
          }
          setIsLoadingLibrary(false);
        })
        .catch(() => setIsLoadingLibrary(false));
    }
  }, [selectedLibrary, loadedIcons]);

  const filteredIcons = useMemo(() => {
    if (!selectedLibrary || !loadedIcons[selectedLibrary]) return [];
    const library = loadedIcons[selectedLibrary];
    const results: Array<{ key: string; name: string; component: IconType }> =
      [];
    Object.keys(library).forEach((iconKey) => {
      if (
        search === "" ||
        iconKey.toLowerCase().includes(search.toLowerCase())
      ) {
        results.push({
          key: `${selectedLibrary}/${iconKey}`,
          name: iconKey,
          component: library[iconKey] as IconType,
        });
      }
    });
    return results;
  }, [search, selectedLibrary, loadedIcons]);

  return (
    <div className="relative mt-1.5" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border px-4 py-2.5 transition-all outline-none focus:ring-1 focus:ring-accent-500/30 disabled:opacity-50",
          isOpen
            ? "border-accent-500/60 ring-1 ring-accent-500/30 bg-dark-800"
            : "border-dark-600 bg-dark-900 hover:bg-dark-800",
        )}
      >
        {value ? (
          <div className="flex items-center gap-2">
            <IconComponent
              iconName={value}
              className="text-xl text-foreground"
            />
            <span className="text-sm text-foreground">
              {value.split("/")[1]}
            </span>
          </div>
        ) : (
          <span className="text-sm text-dark-400">{placeholder}</span>
        )}
        <HiChevronDown
          className={cn(
            "w-4 h-4 text-dark-400 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id="icon-dropdown-portal"
            className="absolute z-1000 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-96"
            style={{
              top: `${dropdownPos.top}px`,
              left: `${dropdownPos.left}px`,
              width: `${dropdownPos.width}px`,
            }}
          >
            <div className="p-3 space-y-2 bg-dark-900 border-b border-dark-600">
              <div className="relative">
                <select
                  value={selectedLibrary}
                  onChange={(e) => {
                    setSelectedLibrary(e.target.value);
                    setSearch("");
                  }}
                  className="w-full appearance-none rounded-xl border border-dark-600 bg-dark-800 px-4 py-2 text-sm text-foreground outline-none transition-all focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30"
                >
                  <option value="" className="bg-dark-800">
                    Select Icon Library
                  </option>
                  {options.map((opt) => (
                    <option
                      key={opt.key}
                      value={opt.key}
                      className="bg-dark-800"
                    >
                      {opt.name}
                    </option>
                  ))}
                </select>
                <HiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-dark-400" />
              </div>

              {selectedLibrary && (
                <div className="relative flex items-center gap-2">
                  <FaSearch className="absolute left-4 text-xs text-dark-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search icons..."
                    className="w-full rounded-xl border border-dark-600 bg-dark-800 pl-10 pr-4 py-2 text-sm text-foreground outline-none transition-all focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30"
                  />
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 min-h-25">
              {!selectedLibrary ? (
                <div className="flex flex-col items-center justify-center py-8 opacity-50">
                  <div className="text-sm text-dark-400">
                    Please select a library first
                  </div>
                </div>
              ) : isLoadingLibrary ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
                  <div className="mt-2 text-sm text-dark-400">
                    Loading icons...
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-2">
                  {filteredIcons.map((icon) => (
                    <button
                      key={icon.key}
                      type="button"
                      onClick={() => {
                        onChange(icon.key);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "flex items-center justify-center rounded-lg p-2.5 transition-all hover:bg-accent-500/20 hover:scale-110",
                        value === icon.key
                          ? "bg-accent-500 text-white shadow-lg shadow-accent-500/30"
                          : "text-foreground",
                      )}
                      title={icon.name}
                    >
                      {React.createElement(icon.component, {
                        className: "text-2xl",
                      })}
                    </button>
                  ))}
                  {filteredIcons.length === 0 && (
                    <div className="col-span-6 py-8 text-center text-sm text-dark-400">
                      No icons found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
