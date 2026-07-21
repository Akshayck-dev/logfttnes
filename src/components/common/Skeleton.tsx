import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-2xl bg-white/10 backdrop-blur-md border border-white/5',
        className
      )}
    />
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="glass-card p-5 space-y-4 rounded-3xl">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-36 rounded-xl" />
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
};

export const SkeletonRing: React.FC = () => {
  return (
    <div className="glass-card p-6 flex flex-col items-center justify-center space-y-4 rounded-3xl">
      <Skeleton className="w-44 h-44 rounded-full" />
      <Skeleton className="h-4 w-32 rounded-lg" />
    </div>
  );
};
