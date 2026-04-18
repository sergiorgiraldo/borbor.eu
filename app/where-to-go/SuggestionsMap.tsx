"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Suggestion = { city: string; country: string; lat?: number; lng?: number };

type Props = {
  suggestions: Suggestion[];
  selected: string | null;
};

// Fix default leaflet marker icons (missing in webpack builds)
function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

function highlightIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;background:#1d4ed8;border:2px solid white;border-radius:50%;box-shadow:0 0 6px rgba(0,0,0,.4)"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function defaultIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;background:#16a34a;border:2px solid white;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,.3)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function MapRecenter({ suggestions }: { suggestions: Suggestion[] }) {
  const map = useMap();
  useEffect(() => {
    const valid = suggestions.filter((s) => s.lat !== undefined && s.lng !== undefined);
    if (valid.length === 0) return;
    if (valid.length === 1) {
      map.setView([valid[0].lat!, valid[0].lng!], 6);
      return;
    }
    const lats = valid.map((s) => s.lat!);
    const lngs = valid.map((s) => s.lng!);
    map.fitBounds(
      [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ],
      { padding: [40, 40] }
    );
  }, [suggestions, map]);
  return null;
}

export default function SuggestionsMap({ suggestions, selected }: Props) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const mapped = suggestions.filter((s) => s.lat !== undefined && s.lng !== undefined);

  const center: [number, number] =
    mapped.length > 0 ? [mapped[0].lat!, mapped[0].lng!] : [20, 0];

  return (
    <div className="w-full h-64 rounded overflow-hidden border border-blue-200">
      <MapContainer
        center={center}
        zoom={4}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapRecenter suggestions={suggestions} />
        {mapped.map((s) => {
          const id = `${s.city}-${s.country}`;
          const isSelected = selected === id;
          return (
            <Marker
              key={id}
              position={[s.lat!, s.lng!]}
              icon={isSelected ? highlightIcon() : defaultIcon()}
            >
              <Popup>
                <span className="font-medium">{s.city}</span>
                <br />
                <span className="text-sm text-blue-600">{s.country}</span>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
