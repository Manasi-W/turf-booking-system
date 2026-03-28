"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";

interface TurfGalleryProps {
  images: string[];
  alt: string;
}

export default function TurfGallery({ images, alt }: TurfGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const galleryImages = images.length > 0 ? images : [
    "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1200",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200",
    "https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=1200"
  ];

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="space-y-4">
      {/* Main Feature Image */}
      <div className="relative aspect-video rounded-3xl overflow-hidden group shadow-xl border border-gray-100">
        <img 
          src={galleryImages[activeImageIndex]} 
          alt={alt} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="absolute bottom-6 right-6 p-3 bg-white/90 backdrop-blur rounded-2xl text-turf-dark shadow-xl opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 active:scale-95"
        >
          <Maximize2 size={24} />
        </button>

        {galleryImages.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur rounded-2xl text-turf-dark shadow-xl opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 hover:bg-turf-green hover:text-white"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur rounded-2xl text-turf-dark shadow-xl opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 hover:bg-turf-green hover:text-white"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
        {galleryImages.map((img, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveImageIndex(idx)}
            className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
              activeImageIndex === idx ? "border-turf-green scale-95 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <img src={img} alt={`${alt} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Fullscreen Slider Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-turf-dark/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-12 animate-in fade-in duration-300">
          <button 
            onClick={() => setIsModalOpen(false)}
            className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all"
          >
            <X size={32} />
          </button>

          <div className="relative w-full max-w-6xl aspect-video flex items-center justify-center">
            <img 
              src={galleryImages[activeImageIndex]} 
              alt={alt} 
              className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain animate-in zoom-in-95 duration-300"
            />

            {galleryImages.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-0 sm:-left-12 p-4 bg-white/10 hover:bg-turf-green text-white rounded-3xl transition-all"
                >
                  <ChevronLeft size={40} />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-0 sm:-right-12 p-4 bg-white/10 hover:bg-turf-green text-white rounded-3xl transition-all"
                >
                  <ChevronRight size={40} />
                </button>
              </>
            )}
          </div>

          <div className="mt-8 text-white font-black tracking-widest uppercase text-xs opacity-50">
            {activeImageIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
