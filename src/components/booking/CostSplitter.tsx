"use client";

import { useState, useEffect } from "react";
import { Users, IndianRupee, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CostSplitterProps {
  totalPrice: number;
  turfName: string;
}

export default function CostSplitter({ totalPrice, turfName }: CostSplitterProps) {
  const [players, setPlayers] = useState(12);
  const [costPerPlayer, setCostPerPlayer] = useState(totalPrice / 12);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setCostPerPlayer(totalPrice / (players || 1));
  }, [players, totalPrice]);

    const perPlayer = Math.ceil(costPerPlayer);

    const handleInvite = async () => {
        const message = `Hey team! ⚽ I'm booking ${turfName}. With ${players} players, it's just ₹${perPlayer} per person. Join the game here: ${window.location.href}`;
        
        try {
            await navigator.clipboard.writeText(message);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <h3 className="text-lg font-bold text-turf-dark mb-4 flex items-center gap-2">
        <Users size={20} className="text-turf-green" />
        Split Cost Calculator
      </h3>
      
      <div className="space-y-6">
        <div>
          <label className="text-sm font-semibold text-muted-foreground block mb-2">Number of Players</label>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="1" 
              max="22" 
              value={players} 
              onChange={(e) => setPlayers(parseInt(e.target.value))}
              className="flex-grow accent-turf-green"
            />
            <span className="text-xl font-bold text-turf-green w-8">{players}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed">
          <div className="p-4 bg-gray-50 rounded-2xl">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Price</div>
            <div className="text-lg font-black text-turf-dark">₹{totalPrice}</div>
          </div>
          <div className="p-4 bg-turf-green/5 rounded-2xl border border-turf-green/10">
            <div className="text-xs font-bold text-turf-green uppercase tracking-wider mb-1">Per Player</div>
            <div className="text-2xl font-black text-turf-green">₹{Math.ceil(costPerPlayer)}</div>
          </div>
        </div>

        <button 
          onClick={handleInvite}
          className={cn(
            "w-full py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2",
            isCopied ? "bg-turf-green text-white" : "bg-gray-900 text-white hover:bg-black"
          )}
        >
          {isCopied ? "Invite Link Copied!" : "Invite Friends to Split"}
        </button>
      </div>
    </div>
  );
}
