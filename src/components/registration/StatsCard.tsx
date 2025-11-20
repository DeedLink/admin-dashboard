import type { JSX } from "react";

interface StatsCardProps {
  title: string;
  verified: number;
  pending: number;
  icon: JSX.Element;
  accent: string;
}

const StatsCard = ({ title, verified, pending, icon, accent }: StatsCardProps) => {
  const total = verified + pending;
  const progress = total ? Math.round((verified / total) * 100) : 0;
  return (
    <div className={`rounded-2xl border p-5 shadow-lg shadow-black/20 text-white ${accent}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">{title}</p>
          <p className="text-3xl font-semibold mt-2">{verified}</p>
          <p className="text-xs text-white/60">Verified accounts</p>
        </div>
        <div className="rounded-xl border border-white/30 bg-black/20 p-3">{icon}</div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-white/70">
        <span>{pending} pending</span>
        <span>{progress}% compliant</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-white/20 overflow-hidden">
        <div
          className="h-full bg-white/90 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-[11px] text-white/60 mt-2">Monitoring across smart-contract approvals & KYC.</p>
    </div>
  );
};

export default StatsCard;
