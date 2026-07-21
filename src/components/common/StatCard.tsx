import React from 'react';
import { GlassCard } from './GlassCard';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  target?: string | number;
  progressPct?: number;
  icon: React.ReactNode;
  accentGradient: string;
  barColor: string;
  subtitle?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  target,
  progressPct = 0,
  icon,
  accentGradient,
  barColor,
  subtitle,
  onClick
}) => {
  const clampedPct = Math.min(Math.max(progressPct, 0), 100);

  return (
    <GlassCard
      interactive={Boolean(onClick)}
      onClick={onClick}
      aria-label={`${title}: ${value} ${unit || ''}`}
      className="flex flex-col justify-between h-full min-h-[140px] group border-white/10 hover:border-white/20"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
            {title}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black tracking-tight text-white">{value}</span>
            {unit && <span className="text-xs font-semibold text-zinc-400">{unit}</span>}
          </div>
        </div>
        <div className={cn('p-2.5 rounded-2xl text-white shadow-lg shrink-0', accentGradient)}>
          {icon}
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        {target && (
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400">
            <span>Goal Progress</span>
            <span className="text-white font-extrabold">
              {clampedPct}% ({target} {unit})
            </span>
          </div>
        )}
        {progressPct !== undefined && (
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden p-0.5">
            <div
              className={cn('h-full transition-all duration-700 ease-out rounded-full', barColor)}
              style={{ width: `${clampedPct}%` }}
            />
          </div>
        )}
        {subtitle && <p className="text-[11px] font-semibold text-zinc-400">{subtitle}</p>}
      </div>
    </GlassCard>
  );
};
