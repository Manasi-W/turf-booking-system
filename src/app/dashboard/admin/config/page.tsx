"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Info } from "lucide-react";

interface ConfigItem {
  id: string;
  key: string;
  value: string;
}

export default function ConfigPage() {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  // Local state for our known config keys
  const [platformFee, setPlatformFee] = useState("5"); // Percentage
  const [taxRate, setTaxRate] = useState("18"); // Percentage

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await fetch("/api/admin/config");
      if (res.ok) {
        const data: ConfigItem[] = await res.json();
        setConfigs(data);
        
        // Map to local state
        const fee = data.find(c => c.key === "PLATFORM_FEE_PERCENTAGE");
        if (fee) setPlatformFee(fee.value);
        
        const tax = data.find(c => c.key === "TAX_RATE_PERCENTAGE");
        if (tax) setTaxRate(tax.value);
      }
    } catch (error) {
      console.error("Failed to load configs", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async (key: string, value: string) => {
    setIsSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      
      if (res.ok) {
        setMessage("Configuration updated successfully.");
        fetchConfigs(); // Refresh
      } else {
        setMessage("Failed to update configuration.");
      }
    } catch (error) {
      setMessage("An error occurred.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleSaveAll = async () => {
    await saveConfig("PLATFORM_FEE_PERCENTAGE", platformFee);
    await saveConfig("TAX_RATE_PERCENTAGE", taxRate);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-turf-green" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-turf-dark">Platform Configuration</h1>
        <p className="text-muted-foreground mt-1">Manage global settings for Turfivo.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium ${message.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <div className="space-y-8 max-w-2xl">
          
          <div className="space-y-4">
             <div className="flex items-start gap-2 text-turf-dark">
                <Info size={18} className="text-blue-500 mt-1" />
                <div>
                   <h3 className="font-bold">Platform Fee</h3>
                   <p className="text-sm text-muted-foreground">The percentage cut taken by the platform on every booking.</p>
                </div>
             </div>
             <div className="flex items-center gap-4 pl-7">
               <div className="relative">
                 <input 
                   type="number"
                   value={platformFee}
                   onChange={(e) => setPlatformFee(e.target.value)}
                   className="w-32 pl-4 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green font-bold text-turf-dark"
                 />
                 <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">%</span>
               </div>
             </div>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-4">
             <div className="flex items-start gap-2 text-turf-dark">
                <Info size={18} className="text-blue-500 mt-1" />
                <div>
                   <h3 className="font-bold">Tax Rate (GST/VAT)</h3>
                   <p className="text-sm text-muted-foreground">The government tax applied to bookings.</p>
                </div>
             </div>
             <div className="flex items-center gap-4 pl-7">
               <div className="relative">
                 <input 
                   type="number"
                   value={taxRate}
                   onChange={(e) => setTaxRate(e.target.value)}
                   className="w-32 pl-4 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green font-bold text-turf-dark"
                 />
                 <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">%</span>
               </div>
             </div>
          </div>
          
          <div className="pt-4 flex pl-7">
             <button 
               onClick={handleSaveAll}
               disabled={isSaving}
               className="flex items-center gap-2 px-6 py-3 bg-turf-green text-white font-bold rounded-xl hover:bg-turf-dark transition-colors disabled:opacity-50"
             >
               {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
               Save Configuration
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}
