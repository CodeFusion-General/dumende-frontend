import React, { useEffect, useRef } from "react";

type LatLng = { lat: number; lng: number };

interface MapPickerProps {
  value?: LatLng;
  onChange?: (coords: LatLng) => void;
  height?: number | string;
  zoom?: number;
  readOnly?: boolean;
}

declare global {
  interface Window {
    L: any;
    __leafletLoading?: boolean;
  }
}

const leafletCssUrl = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const leafletJsUrl = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

function ensureLeafletLoaded(): Promise<any> {
  if (window.L) return Promise.resolve(window.L);
  if (window.__leafletLoading) {
    return new Promise((resolve) => {
      const check = () => (window.L ? resolve(window.L) : setTimeout(check, 50));
      check();
    });
  }
  window.__leafletLoading = true;

  // Inject CSS
  const existingCss = document.querySelector(`link[href="${leafletCssUrl}"]`);
  if (!existingCss) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = leafletCssUrl;
    document.head.appendChild(link);
  }

  // Inject JS
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${leafletJsUrl}"]`);
    if (existingScript) {
      const check = () => (window.L ? resolve(window.L) : setTimeout(check, 50));
      check();
      return;
    }
    const script = document.createElement("script");
    script.src = leafletJsUrl;
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = (e) => reject(e);
    document.body.appendChild(script);
  });
}

export const MapPicker: React.FC<MapPickerProps> = ({
  value,
  onChange,
  height = 420,
  zoom = 12,
  readOnly = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);

  useEffect(() => {
    let isMounted = true;
    ensureLeafletLoaded()
      .then((L) => {
        if (!isMounted || !containerRef.current) return;
        if (!mapRef.current) {
          const center: LatLng = value ?? { lat: 41.0082, lng: 28.9784 }; // İstanbul varsayılan
          const map = L.map(containerRef.current).setView([center.lat, center.lng], zoom);
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
          }).addTo(map);

          // İlk marker
          markerRef.current = L.marker([center.lat, center.lng], { draggable: !readOnly }).addTo(map);
          if (!readOnly && onChange) {
            markerRef.current.on("dragend", () => {
              const pos = markerRef.current.getLatLng();
              onChange({ lat: pos.lat, lng: pos.lng });
            });

            map.on("click", (e: any) => {
              const lat = e.latlng.lat;
              const lng = e.latlng.lng;
              markerRef.current.setLatLng([lat, lng]);
              onChange({ lat, lng });
            });
          }

          mapRef.current = map;
        }

        // Değer güncellenirse marker ve view güncelle
        if (value && markerRef.current && mapRef.current) {
          markerRef.current.setLatLng([value.lat, value.lng]);
        }
      })
      .catch(() => {
        // sessiz hata: harita yüklenemezse UI çökmesin
      });

    return () => {
      isMounted = false;
      // Haritayı unmount ederken Leaflet instancelarını temizlemeyelim, sayfa içinde reuse edilebilir
    };
  }, [value, zoom, onChange]);

  return (
    <div
      ref={containerRef}
      style={{ height: typeof height === "number" ? `${height}px` : height, width: "100%", borderRadius: 8, overflow: "hidden" }}
      className="relative z-auto"
    />
  );
};

export default MapPicker;


