import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateLevel(points: number): number {
  // Every 100 points = 1 level
  return Math.floor(points / 100) + 1;
}

export function getPointsForNextLevel(currentPoints: number): number {
  const currentLevel = calculateLevel(currentPoints);
  return currentLevel * 100;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 30) return '🔥💯';
  if (streak >= 14) return '🔥🔥';
  if (streak >= 7) return '🔥';
  if (streak >= 3) return '⚡';
  return '✨';
}

export function getNeurodivergentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    ADHD: 'ADHD',
    AUTISM: 'Autism Spectrum',
    DYSLEXIA: 'Dyslexia',
    DYSCALCULIA: 'Dyscalculia',
    DYSGRAPHIA: 'Dysgraphia',
    MIXED: 'Mixed Profile',
    OTHER: 'Other',
  };
  return labels[type] || type;
}

export function getDifficultyColor(level: string): string {
  const colors: Record<string, string> = {
    BEGINNER: 'text-green-600 bg-green-100',
    INTERMEDIATE: 'text-yellow-600 bg-yellow-100',
    ADVANCED: 'text-red-600 bg-red-100',
  };
  return colors[level] || 'text-gray-600 bg-gray-100';
}
