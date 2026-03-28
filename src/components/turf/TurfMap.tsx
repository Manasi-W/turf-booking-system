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
            <Popup>
              <div className="p-1">
                <h4 className="font-bold text-turf-dark m-0">{turf.name}</h4>
                <p className="text-xs text-muted-foreground m-0 mt-1">{turf.location}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
