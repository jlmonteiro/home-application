/**
 * Format currency values to Euro.
 */
export const formatEuro = (value: string | undefined | null): string => {
  if (!value) return ''
  if (value.startsWith('€')) return value
  return `€${value}`
}