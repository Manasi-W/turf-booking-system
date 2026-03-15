"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, Send, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useSession } from "next-auth/react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    name: string | null;
    role: string;
  } | null;
}

export default function ReviewSection({ turfId }: { turfId: string }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [turfId]);

  async function fetchReviews() {
    try {
      const res = await fetch(`/api/turfs/${turfId}/reviews`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/turfs/${turfId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      setSuccess(true);
      setComment("");
      setRating(5);
      fetchReviews();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h2 className="text-2xl font-black text-turf-dark mb-2">Customer Reviews</h2>
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                 {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                        key={s} 
                        size={18} 
                        className={cn(
                            s <= Math.round(averageRating) ? "text-orange-500 fill-current" : "text-gray-200"
                        )} 
                    />
                 ))}
              </div>
              <span className="font-bold text-turf-dark">{averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground text-sm">• {reviews.length} reviews</span>
           </div>
        </div>
      </div>

      {session && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
           <div className="flex justify-between items-center">
              <h4 className="font-bold text-turf-dark flex items-center gap-2">
                 <MessageSquare size={18} className="text-turf-green" /> Leave a Review
              </h4>
              <div className="flex gap-1">
                 {[1, 2, 3, 4, 5].map((s) => (
                    <button 
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className="transition-transform active:scale-90"
                    >
                        <Star 
                            size={24} 
                            className={cn(
                                s <= rating ? "text-orange-500 fill-current" : "text-gray-200 hover:text-orange-200"
                            )} 
                        />
                    </button>
                 ))}
              </div>
           </div>

           <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your experience..."
                className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 focus:border-turf-green outline-none min-h-[120px] transition-all resize-none font-medium"
           />

           {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
           {success && (
                <div className="flex items-center gap-2 text-turf-green text-xs font-bold animate-fade-in">
                    <CheckCircle2 size={14} /> Review submitted successfully!
                </div>
           )}

           <button 
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-turf-dark text-white font-bold rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2"
           >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Post Review</>}
           </button>
           <p className="text-[10px] text-center text-muted-foreground italic">Only users with completed bookings can leave reviews.</p>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
            <div className="col-span-2 py-20 flex justify-center">
                <Loader2 className="animate-spin text-turf-green" size={40} />
            </div>
        ) : reviews.length > 0 ? (
            reviews.map((review) => (
                <div key={review.id} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-turf-dark">
                                {review.user?.name?.[0] || "?"}
                            </div>
                            <div>
                                <p className="font-bold text-turf-dark text-sm">{review.user?.name || "Anonymous User"}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                    {format(new Date(review.createdAt), "MMM dd, yyyy")}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star 
                                    key={s} 
                                    size={12} 
                                    className={cn(
                                        s <= review.rating ? "text-orange-500 fill-current" : "text-gray-100"
                                    )} 
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-turf-dark/80 leading-relaxed italic">
                        "{review.comment || "Great experience playing here!"}"
                    </p>
                </div>
            ))
        ) : (
            <div className="col-span-2 py-20 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                <MessageSquare className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-muted-foreground font-medium">No reviews yet. Be the first to share your experience!</p>
            </div>
        )}
      </div>
    </div>
  );
}
