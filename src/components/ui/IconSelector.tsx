import React from "react";
import type { IconType } from "react-icons";

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
  {
    name: "Ant Design",
    key: "Ai",
  },
  {
    name: "Bootstrap",
    key: "Bs",
  },
  {
    name: "BoxIcons",
    key: "Bi",
  },
  {
    name: "css.gg",
    key: "Cg",
  },
  {
    name: "Circum Icons",
    key: "Ci",
  },
  {
    name: "Devicons",
    key: "Di",
  },
  {
    name: "Font Awesome",
    key: "Fa",
  },
  {
    name: "Font Awesome 6",
    key: "Fa6",
  },
  {
    name: "Flat Color Icons",
    key: "Fc",
  },
  {
    name: "Feather",
    key: "Fi",
  },
  {
    name: "Github Octicons",
    key: "Go",
  },
  {
    name: "Grommet Icons",
    key: "Gr",
  },
  {
    name: "Heroicons",
    key: "Hi",
  },
  {
    name: "Heroicons 2",
    key: "Hi2",
  },
  {
    name: "IcoMoon Free",
    key: "Im",
  },
  {
    name: "Ionicons 4",
    key: "Io",
  },
  {
    name: "Ionicons 5",
    key: "Io5",
  },
  {
    name: "Icons8 Line Awesome",
    key: "Lia",
  },
  {
    name: "Lucide",
    key: "Lu",
  },
  {
    name: "Material Design",
    key: "Md",
  },
  {
    name: "Phosphor",
    key: "Pi",
  },
  {
    name: "Remix Icon",
    key: "Ri",
  },
  {
    name: "Radix UI",
    key: "Rx",
  },
  {
    name: "Simple Icons",
    key: "Si",
  },
  {
    name: "Simple Line Icons",
    key: "Sl",
  },
  {
    name: "Tabler Icons",
    key: "Tb",
  },
  {
    name: "Themify Icons",
    key: "Tfi",
  },
  {
    name: "Typicons",
    key: "Ti",
  },
  {
    name: "VS Code Icons",
    key: "Vsc",
  },
  {
    name: "Weather Icons",
    key: "Wi",
  },
];

// Helper function to load icon library
async function loadIconLibrary(key: string) {
  if (loadedLibraries[key]) {
    return loadedLibraries[key];
  }
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
  children?: React.ReactNode;
  size?: number;
  color?: string;
  title?: string;
}

export const IconComponent = ({ iconName, ...props }: IconComponentProps) => {
  const [IconSelected, setIconSelected] = React.useState<IconType | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
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
    if (!provider || !code) {
      setIsLoading(false);
      return;
    }

    loadIconLibrary(provider)
      .then((library) => {
        if (library && code && library[code]) {
          setIconSelected(() => library[code] as IconType);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [iconName]);

  if (isLoading) {
    return (
      <svg
        {...props}
        className={`${props.className || ""} animate-pulse rounded bg-gray-200`}
        style={{ width: "1em", height: "1em", ...props.style }}
      />
    );
  }

  if (!IconSelected) {
    return (
      <svg
        {...props}
        className={`${props.className || ""} rounded border border-gray-300`}
        style={{ width: "1em", height: "1em", ...props.style }}
      />
    );
  }

  return <IconSelected {...props} />;
};

interface Props {
  value: string;
  onChange: (iconName: string) => void;
  placeholder?: string;
}

export default function IconSelector({
  value,
  onChange,
  placeholder = "Select an icon",
}: Props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [selectedLibrary, setSelectedLibrary] = React.useState<string>("");
  const [loadedIcons, setLoadedIcons] = React.useState<
    Record<string, Record<string, IconType>>
  >({});
  const [isLoadingLibrary, setIsLoadingLibrary] = React.useState(false);

  // Load icon library when selected
  React.useEffect(() => {
    if (selectedLibrary && !loadedIcons[selectedLibrary]) {
      setIsLoadingLibrary(true);
      loadIconLibrary(selectedLibrary)
        .then((library) => {
          if (library) {
            setLoadedIcons((prev) => ({
              ...prev,
              [selectedLibrary]: library,
            }));
          }
          setIsLoadingLibrary(false);
        })
        .catch(() => {
          setIsLoadingLibrary(false);
        });
    }
  }, [selectedLibrary, loadedIcons]);

  const filteredIcons = React.useMemo(() => {
    // Only show icons if library is selected and loaded
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
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 text-left transition-colors hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        {value ? (
          <div className="flex items-center gap-2">
            <IconComponent iconName={value} className="text-xl" />
            <span className="text-sm">{value.split("/")[1]}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-500">{placeholder}</span>
        )}
        <svg
          className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
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

      {isOpen && (
        <div className="absolute z-9999 mt-2 w-full rounded-lg border border-gray-300 bg-white shadow-lg">
          <div className="space-y-2 p-3">
            <select
              value={selectedLibrary}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setSelectedLibrary(e.target.value);
                setSearch("");
              }}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Icon Library</option>
              {options.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.name}
                </option>
              ))}
            </select>
            {selectedLibrary && (
              <input
                type="text"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
                placeholder="Search icons..."
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            )}
          </div>

          {selectedLibrary && (
            <div className="max-h-64 overflow-y-auto border-t border-gray-200 p-2">
              {isLoadingLibrary ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-gray-500">Loading icons...</div>
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
                      className={`flex items-center justify-center rounded p-2 transition-colors hover:bg-blue-100 ${
                        value === icon.key ? "bg-blue-500 text-white" : ""
                      }`}
                      title={icon.name}
                    >
                      {React.createElement(icon.component, {
                        className: "text-2xl",
                      })}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
