import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateBmi(weightKg: number, heightCm: number): number {
  if (!heightCm || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

export function getBmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-sky-400 border-sky-500/30 bg-sky-500/10' };
  if (bmi < 25) return { label: 'Optimal / Fit', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
  return { label: 'Obese', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' };
}

export function formatTimeAgo(isoDateString: string): string {
  const date = new Date(isoDateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatCalories(val: number): string {
  return val.toLocaleString();
}
