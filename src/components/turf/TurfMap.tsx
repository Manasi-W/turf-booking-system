"use client";

import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

// Fix for Leaflet marker icons in Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface TurfMapProps {
  turfs: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    location: string;
    pricePerHour: number;
    images?: string[];
  }[];
  center?: [number, number];
  zoom?: number;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function TurfMap({ turfs, center, zoom = 13 }: TurfMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-full w-full bg-gray-100 animate-pulse rounded-3xl" />;

  const mapCenter = center || (turfs.length > 0 ? [turfs[0].lat, turfs[0].lng] : [19.0760, 72.8777]);

  return (
    <div className="h-full w-full rounded-3xl overflow-hidden border border-gray-100 shadow-inner">
      <MapContainer 
        center={mapCenter as [number, number]} 
        zoom={zoom} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={mapCenter as [number, number]} zoom={zoom} />
        {turfs.map((turf) => (
          <Marker 
            key={turf.id} 
            position={[turf.lat, turf.lng]}
            icon={icon}
          >
            <Popup className="turf-popup">
              <div className="w-56 overflow-hidden rounded-2xl bg-white">
                <div className="relative h-24 w-full">
                  <img 
                    src={turf.images?.[0] || "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=400"} 
                    alt={turf.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 backdrop-blur rounded-full text-[10px] font-black text-turf-green">
                    ₹{turf.pricePerHour}
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-turf-dark text-sm mb-0.5 leading-tight">{turf.name}</h4>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-3">
                    <span className="shrink-0 text-turf-green leading-none">📍</span> {turf.location.split(',')[0]}
                  </p>
                  <a 
                    href={`/turf/${turf.id}`}
                    className="block w-full py-2 bg-turf-dark text-white text-[10px] font-bold rounded-lg text-center hover:bg-black transition-all"
                  >
                    View Details & Book
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
