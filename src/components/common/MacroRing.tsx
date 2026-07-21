import React from 'react';
import { motion } from 'framer-motion';

interface RingData {
  label: string;
  current: number;
  target: number;
  color: string;
  trackColor: string;
}

interface MacroRingProps {
  size?: number;
  strokeWidth?: number;
  caloriesCurrent: number;
  caloriesTarget: number;
  proteinCurrent: number;
  proteinTarget: number;
  carbsCurrent: number;
  carbsTarget: number;
  fatCurrent: number;
  fatTarget: number;
}

export const MacroRing: React.FC<MacroRingProps> = ({
  size = 200,
  strokeWidth = 14,
  caloriesCurrent,
  caloriesTarget,
  proteinCurrent,
  proteinTarget,
  carbsCurrent,
  carbsTarget,
  fatCurrent,
  fatTarget
}) => {
  const center = size / 2;

  const rings: RingData[] = [
    {
      label: 'Calories',
      current: caloriesCurrent,
      target: caloriesTarget,
      color: '#FF5E36', // Flame Orange
      trackColor: 'rgba(255, 94, 54, 0.15)'
    },
    {
      label: 'Protein',
      current: proteinCurrent,
      target: proteinTarget,
      color: '#F43F5E', // Rose Pink
      trackColor: 'rgba(244, 63, 94, 0.15)'
    },
    {
      label: 'Carbs',
      current: carbsCurrent,
      target: carbsTarget,
      color: '#00F2FE', // Cyan
      trackColor: 'rgba(0, 242, 254, 0.15)'
    },
    {
      label: 'Fat',
      current: fatCurrent,
      target: fatTarget,
      color: '#10B981', // Emerald
      trackColor: 'rgba(16, 185, 129, 0.15)'
    }
  ];

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {rings.map((ring, idx) => {
          const radius = center - strokeWidth / 2 - idx * (strokeWidth + 4);
          const circumference = 2 * Math.PI * radius;
          const pct = Math.min(Math.max(ring.current / (ring.target || 1), 0), 1);
          const strokeDashoffset = circumference * (1 - pct);

          return (
            <g key={ring.label}>
              {/* Background Track */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                stroke={ring.trackColor}
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Animated Progress Ring */}
              <motion.circle
                cx={center}
                cy={center}
                r={radius}
                stroke={ring.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: idx * 0.15 }}
                strokeLinecap="round"
                fill="none"
              />
            </g>
          );
        })}
      </svg>
      {/* Center Callout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-extrabold tracking-tight text-white">
          {Math.round((caloriesCurrent / (caloriesTarget || 1)) * 100)}%
        </span>
        <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400">
          Daily Goal
        </span>
      </div>
    </div>
  );
};
