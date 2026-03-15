"use client";

import { useEffect, useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { Loader2 } from "lucide-react";

export default function RevenueChart({ apiUrl = "/api/admin/stats" }: { apiUrl?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(apiUrl);
        const stats = await res.json();
        setData(Array.isArray(stats) ? stats : []);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [apiUrl]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-turf-green" size={32} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center italic text-muted-foreground">
        No revenue data available for the last 7 days.
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(34, 197, 94, 0.05)' }}
            contentStyle={{ 
              borderRadius: '1rem', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              padding: '12px'
            }}
            labelStyle={{ fontWeight: 900, color: '#1e293b', marginBottom: '4px' }}
            itemStyle={{ fontWeight: 700, color: '#22c55e' }}
            formatter={(value: any) => [`₹${(value as number).toLocaleString()}`, "Revenue"]}
          />
          <Bar 
            dataKey="amount" 
            radius={[6, 6, 0, 0]} 
            barSize={32}
          >
            {Array.isArray(data) && data.map((entry: any, index: number) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.amount > 0 ? '#22c55e' : '#e2e8f0'} 
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
