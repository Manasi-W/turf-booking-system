"use client";

import dynamic from 'next/dynamic';
import React from 'react';

const TurfMap = dynamic(() => import('./TurfMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-3xl flex items-center justify-center text-muted-foreground italic">Loading Map...</div>
});

interface TurfMapDisplayProps {
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

export default function TurfMapDisplay(props: TurfMapDisplayProps) {
  return <TurfMap {...props} />;
}
