"use client";

import { useState } from "react";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfigFormProps {
  initialData: any;
}

export default function ConfigForm({ initialData }: ConfigFormProps) {
  const [data, setData] = useState(initialData);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleChange = (key: string, value: string) => {
    setData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    try {
      // Send multiple requests for each key-value pair as our API handles one at a time for now
      // Or we could optimize the API to handle an object. Let's do them in parallel.
      const entries = Object.entries(data);
      const results = await Promise.all(entries.map(([key, value]) => 
        fetch("/api/admin/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value: String(value) }),
        })
      ));

      if (results.every(r => r.ok)) {
        setMessage({ type: 'success', text: "Configuration saved successfully!" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error("Some updates failed");
      }
    } catch (error) {
      console.error("Save config error:", error);
      setMessage({ type: 'error', text: "Failed to save configuration." });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Commission Rate (%)</label>
          <div className="relative">
            <input 
              type="number" 
              step="0.1"
              value={data.COMMISSION_RATE}
              onChange={(e) => handleChange("COMMISSION_RATE", e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green outline-none font-bold text-turf-dark transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Platform Name</label>
          <input 
            type="text" 
            value={data.PLATFORM_NAME}
            onChange={(e) => handleChange("PLATFORM_NAME", e.target.value)}
            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green outline-none font-bold text-turf-dark transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Support Email</label>
            <input 
              type="email" 
              value={data.SUPPORT_EMAIL}
              onChange={(e) => handleChange("SUPPORT_EMAIL", e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green outline-none font-bold text-turf-dark transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Support Phone</label>
            <input 
              type="text" 
              value={data.SUPPORT_PHONE}
              onChange={(e) => handleChange("SUPPORT_PHONE", e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green outline-none font-bold text-turf-dark transition-all"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-50">
        <button 
          type="submit" 
          disabled={isPending}
          className="w-full py-5 bg-turf-dark text-white font-black rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-70"
        >
          {isPending ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              <Save size={20} />
              Save Configuration
            </>
          )}
        </button>

        {message && (
          <div className={cn(
            "mt-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in",
            message.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
          )}>
            <CheckCircle2 size={18} />
            <p className="text-sm font-bold">{message.text}</p>
          </div>
        )}
      </div>
    </form>
  );
}
