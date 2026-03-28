"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import ReviewModal from "./ReviewModal";

interface RateTurfButtonProps {
  turfId: string;
  turfName: string;
}

export default function RateTurfButton({ turfId, turfName }: RateTurfButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-2 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/10 flex items-center gap-2"
      >
        <Star size={12} className="fill-current" />
        Rate Turf
      </button>

      {showModal && (
        <ReviewModal 
          turfId={turfId} 
          turfName={turfName} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  );
}
