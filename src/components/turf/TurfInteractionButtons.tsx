"use client";

import { useState } from "react";
import { Share2, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TurfInteractionButtons({ turfName }: { turfName: string }) {
  const [isSaved, setIsSaved] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: turfName,
      text: `Check out this turf: ${turfName}`,
      url: window.location.href,
    };

    if (typeof navigator !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        console.error("Error sharing", err);
      }
    }
    
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  return (
    <div className="flex items-center gap-3 relative">
      <button 
        onClick={handleShare}
        className="p-3 border rounded-2xl hover:bg-gray-50 transition-all text-turf-dark flex items-center gap-2 font-bold text-sm bg-white"
      >
        <Share2 size={18} className="text-turf-green" /> 
        {showCopied ? "Link Copied!" : "share"}
      </button>
      <button 
        onClick={handleSave}
        className={cn(
          "p-3 border rounded-2xl transition-all flex items-center gap-2 font-bold text-sm bg-white",
          isSaved ? "text-red-500 border-red-200 bg-red-50" : "text-turf-dark hover:bg-gray-50"
        )}
      >
        <Heart size={18} className={cn(isSaved ? "fill-current" : "text-turf-green")} /> 
        {isSaved ? "Saved" : "Save"}
      </button>
    </div>
  );
}
