"use client";

import { useState } from "react";
import { Star, X, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewModalProps {
  turfId: string;
  turfName: string;
  onClose: () => void;
}

export default function ReviewModal({ turfId, turfName, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/turfs/${turfId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-scale-in relative">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-400 hover:text-turf-dark transition-colors"
        >
          <X size={24} />
        </button>

        {success ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-20 w-20 bg-turf-green text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-turf-green/20">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-black text-turf-dark mb-2">Thank You!</h2>
            <p className="text-muted-foreground font-medium">Your feedback helps the community.</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-black text-turf-dark mb-2">Rate Your Match</h2>
              <p className="text-muted-foreground font-medium flex items-center gap-1.5">
                How was your experience at <span className="text-turf-green font-bold">{turfName}</span>?
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex flex-col items-center gap-4 py-4 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      className="transition-transform active:scale-90"
                    >
                      <Star 
                        size={40} 
                        className={cn(
                          "transition-all",
                          (hover || rating) >= star 
                            ? "fill-orange-400 text-orange-400 drop-shadow-sm" 
                            : "text-gray-300"
                        )}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {rating === 5 ? "Excellent!" : 
                   rating === 4 ? "Very Good" : 
                   rating === 3 ? "Average" : 
                   rating === 2 ? "Below Average" : 
                   rating === 1 ? "Poor" : "Select a Rating"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Write a Review (Optional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about the turf quality, lighting, and amenities..."
                  rows={4}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green outline-none text-sm transition-all resize-none"
                ></textarea>
              </div>

              {error && (
                <p className="text-red-500 text-xs font-bold text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-turf-dark text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : "Submit Review"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
