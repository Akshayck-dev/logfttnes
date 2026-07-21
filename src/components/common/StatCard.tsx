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
      className="flex flex-col justify-between h-full group"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            {title}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold tracking-tight text-white">{value}</span>
            {unit && <span className="text-xs font-semibold text-zinc-400">{unit}</span>}
          </div>
        </div>
        <div className={cn('p-2.5 rounded-2xl text-white shadow-lg', accentGradient)}>
          {icon}
        </div>
      </div>

      <div className="mt-4">
        {target && (
          <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400 mb-1.5">
            <span>Progress</span>
            <span>
              {clampedPct}% ({target} {unit})
            </span>
          </div>
        )}
        {progressPct !== undefined && (
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className={cn('h-full transition-all duration-700 ease-out rounded-full', barColor)}
              style={{ width: `${clampedPct}%` }}
            />
          </div>
        )}
        {subtitle && <p className="text-[11px] font-medium text-zinc-400 mt-2">{subtitle}</p>}
      </div>
    </GlassCard>
  );
};
