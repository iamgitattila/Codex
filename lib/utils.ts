import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function calculateReadability(text: string): number {
  // Simple Flesch-Kincaid grade level calculation
  const words = text.split(/\s+/).length
  const sentences = text.split(/[.!?]+/).length
  const syllables = text.split(/\s+/).reduce((count, word) => {
    return count + countSyllables(word)
  }, 0)

  if (words === 0 || sentences === 0) return 0

  const gradeLevel = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59
  return Math.max(0, Math.round(gradeLevel * 10) / 10)
}

function countSyllables(word: string): number {
  word = word.toLowerCase()
  if (word.length <= 3) return 1
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, '')
  const syllables = word.match(/[aeiouy]{1,2}/g)
  return syllables ? syllables.length : 1
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}
