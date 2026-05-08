import countries from "@/countries";
import React, { Fragment, useState } from "react";
import { MdClose, MdSearch } from "react-icons/md";

interface Props {
  value: string;
  onChange: (countryCode: string) => void;
  placeholder?: string;
}

export default function FlagSelector({
  value,
  onChange,
  placeholder = "Select country",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedCountry = countries.find((c) => c.code === value);

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(search.toLowerCase()) ||
      country.code.toLowerCase().includes(search.toLowerCase()) ||
      country.key.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-left transition-colors hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        {selectedCountry ? (
          <div className="flex items-center gap-2">
            {React.createElement(
              selectedCountry.flag as unknown as React.ComponentType<{
                className: string;
              }>,
              { className: "h-5 w-7 rounded border border-gray-200" },
            )}
            <span className="text-sm font-medium">{selectedCountry.name}</span>
            <span className="text-xs text-gray-500">
              ({selectedCountry.code})
            </span>
          </div>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <div className="flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded p-1 hover:bg-gray-100"
            >
              <MdClose size={16} />
            </button>
          )}
          <MdSearch size={20} className="text-gray-400" />
        </div>
      </button>

      {isOpen && (
        <Fragment>
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setIsOpen(false);
              setSearch("");
            }}
          />
          <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg">
            <div className="border-b border-gray-200 p-2">
              <div className="relative">
                <MdSearch
                  size={20}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  // @ts-ignore
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country..."
                  className="w-full rounded-lg border border-gray-300 py-2 pr-3 pl-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => {
                  return (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleSelect(country.code)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-blue-50 ${
                        value === country.code ? "bg-blue-100" : ""
                      }`}
                    >
                      {React.createElement(
                        country.flag as unknown as React.ComponentType<{
                          className: string;
                        }>,
                        {
                          className:
                            "h-5 w-7 shrink-0 rounded border border-gray-200",
                        },
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {country.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {country.code} • {country.key}
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-8 text-center text-sm text-gray-500">
                  No countries found
                </div>
              )}
            </div>
          </div>
        </Fragment>
      )}
    </div>
  );
}
