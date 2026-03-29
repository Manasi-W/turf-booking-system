"use client";

import { useState } from "react";
import { Share2, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TurfInteractionButtons({ turfName }: { turfName: string }) {
  const [isSaved, setIsSaved] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);

    const shareData = {
      title: turfName,
      text: `Check out this turf: ${turfName}`,
      url: window.location.href,
    };

    try {
      if (typeof navigator !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        throw new Error("Sharing not supported");
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Error sharing", err);
        // Fallback: Copy to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          setShowCopied(true);
          setTimeout(() => setShowCopied(false), 2000);
        } catch (clipErr) {
          console.error("Failed to copy", clipErr);
        }
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative w-full sm:w-auto">
      <button 
        onClick={handleShare}
        disabled={isSharing}
        className="p-3 border rounded-2xl hover:bg-gray-50 transition-all text-turf-dark flex items-center justify-center gap-2 font-bold text-sm bg-white disabled:opacity-50 w-full sm:w-auto"
      >
        <Share2 size={18} className="text-turf-green" /> 
        {showCopied ? "Link Copied!" : isSharing ? "Sharing..." : "share"}
      </button>
      <button 
        onClick={handleSave}
        className={cn(
          "p-3 border rounded-2xl transition-all flex items-center justify-center gap-2 font-bold text-sm bg-white w-full sm:w-auto",
          isSaved ? "text-red-500 border-red-200 bg-red-50" : "text-turf-dark hover:bg-gray-50"
        )}
      >
        <Heart size={18} className={cn(isSaved ? "fill-current" : "text-turf-green")} /> 
        {isSaved ? "Saved" : "Save"}
      </button>
    </div>
  );
}
