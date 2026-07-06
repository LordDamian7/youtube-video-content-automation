import React from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  accent?: string;
}

export default function MetricCard({ title, value, icon, subtitle, accent }: MetricCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 relative overflow-hidden transition-all hover:border-zinc-700">
      <div className={`absolute top-0 left-0 w-1 h-full ${accent || "bg-orange-500"}`} />
      <div className="flex justify-between items-start">
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-mono font-medium">{title}</p>
          <h4 className="text-2xl font-bold text-zinc-100 mt-2 font-mono">{value}</h4>
          {subtitle && (
            <p className="text-zinc-400 text-xs mt-1 font-sans">{subtitle}</p>
          )}
        </div>
        <div className="text-zinc-400 p-2 bg-zinc-850 rounded border border-zinc-800">
          {icon}
        </div>
      </div>
    </div>
  );
}
