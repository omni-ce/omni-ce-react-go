import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { IconComponent } from "./IconSelector";
import { useLanguageStore } from "@/stores/languageStore";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export interface MapCoordinates {
  longitude: number;
  latitude: number;
}

interface MapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (coords: MapCoordinates) => void;
  initialCoords?: MapCoordinates;
}

// Custom hook to handle map clicks
function LocationMarker({
  position,
  setPosition,
}: {
  position: L.LatLng | null;
  setPosition: (p: L.LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
}

interface Result {
  name: string;
  display_name: string;
  lat: string;
  lon: string;
}

function MapUpdater({ center }: { center: L.LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapPicker({
  isOpen,
  onClose,
  onSelect,
  initialCoords,
}: MapPickerProps) {
  const { language } = useLanguageStore();
  const [basemap, setBasemap] = useState<"street" | "satellite">("satellite");
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Result[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<L.LatLng>(
    new L.LatLng(-6.2088, 106.8456),
  ); // Default to Jakarta

  useEffect(() => {
    if (isOpen) {
      if (initialCoords && initialCoords.latitude && initialCoords.longitude) {
        const latlng = new L.LatLng(
          initialCoords.latitude,
          initialCoords.longitude,
        );
        setPosition(latlng);
        setMapCenter(latlng);
      } else {
        setPosition(null);
        setMapCenter(new L.LatLng(-6.2088, 106.8456));
      }
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isOpen, initialCoords]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`,
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: Result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const latlng = new L.LatLng(lat, lon);
    setPosition(latlng);
    setMapCenter(latlng);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  const handleConfirm = () => {
    if (position) {
      onSelect({ latitude: position.lat, longitude: position.lng });
    }
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6 md:p-8">
      <div className="bg-dark-900 border border-dark-600/50 rounded-2xl w-full max-w-4xl h-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-600/50 bg-dark-800/50 shrink-0">
          <h2 className="text-lg font-bold text-foreground">
            {language({ id: "Pilih Lokasi", en: "Pick Location" })}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-dark-300 hover:text-foreground hover:bg-dark-700/50 rounded-lg transition-colors"
          >
            <IconComponent iconName="Ri/RiCloseLine" className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col relative min-h-0">
          {/* Search Bar */}
          <div className="absolute top-4 left-4 right-4 z-[400] max-w-md mx-auto">
            <div className="relative flex items-center bg-dark-800 border border-dark-600/50 rounded-xl shadow-lg">
              <input
                type="text"
                placeholder={language({
                  id: "Cari tempat...",
                  en: "Search place...",
                })}
                className="w-full bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-dark-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-4 text-dark-300 hover:text-accent-400 transition-colors"
              >
                {isSearching ? (
                  <IconComponent
                    iconName="Ri/RiLoader4Line"
                    className="w-5 h-5 animate-spin"
                  />
                ) : (
                  <IconComponent
                    iconName="Ri/RiSearchLine"
                    className="w-5 h-5"
                  />
                )}
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-600/50 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectResult(result)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-dark-700/50 border-b border-dark-700/30 last:border-0 transition-colors"
                  >
                    <p className="text-foreground font-medium truncate">
                      {result.name || result.display_name.split(",")[0]}
                    </p>
                    <p className="text-xs text-dark-400 truncate mt-0.5">
                      {result.display_name}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="flex-1 w-full bg-dark-800 relative z-[10]">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              {basemap === "street" ? (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              ) : (
                <TileLayer
                  attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              )}
              <LocationMarker position={position} setPosition={setPosition} />
              <MapUpdater center={mapCenter} />
            </MapContainer>

            {/* Basemap Switcher */}
            <div className="absolute bottom-6 right-6 z-[400]">
              <div className="flex bg-dark-900/80 backdrop-blur-md border border-dark-600/50 rounded-xl p-1 shadow-2xl">
                <button
                  onClick={() => setBasemap("street")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    basemap === "street"
                      ? "bg-accent-500 text-white"
                      : "text-dark-300 hover:text-foreground"
                  }`}
                >
                  {language({ id: "Peta", en: "Street" })}
                </button>
                <button
                  onClick={() => setBasemap("satellite")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    basemap === "satellite"
                      ? "bg-accent-500 text-white"
                      : "text-dark-300 hover:text-foreground"
                  }`}
                >
                  {language({ id: "Satelit", en: "Satellite" })}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-dark-600/50 bg-dark-800/50 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2 text-dark-300 text-sm">
            <IconComponent
              iconName="Hi/HiOutlineInformationCircle"
              className="w-4 h-4"
            />
            <span>
              {language({
                id: "Klik pada peta untuk memilih lokasi.",
                en: "Click on the map to pick a location.",
              })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-dark-300 hover:text-foreground hover:bg-dark-700/50 transition-colors"
            >
              {language({ id: "Batal", en: "Cancel" })}
            </button>
            <button
              onClick={handleConfirm}
              disabled={!position}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
                position
                  ? "bg-accent-500 hover:bg-accent-400 text-white shadow-lg shadow-accent-500/20"
                  : "bg-dark-700 text-dark-400 cursor-not-allowed"
              }`}
            >
              {language({ id: "Pilih Lokasi", en: "Select Location" })}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
