/**
 * Utility functions for handling unit conversions.
 */

export function convertQuantity(
  quantity: number,
  fromUnit: string,
  toUnit: string,
  pcQuantity?: number,
  pcUnit?: string
): number {
  if (fromUnit === toUnit) return quantity

  // Standard mass conversions to grams
  const getMassInGrams = (q: number, u: string) => {
    if (u === 'kg') return q * 1000
    if (u === 'g') return q
    if (u === 'mg') return q / 1000
    return null
  }

  // Standard volume conversions to milliliters
  const getVolumeInMl = (q: number, u: string) => {
    if (u === 'l') return q * 1000
    if (u === 'ml') return q
    return null
  }

  // Helper to convert from grams to target mass unit
  const fromGramsTo = (g: number, u: string) => {
    if (u === 'kg') return g / 1000
    if (u === 'g') return g
    if (u === 'mg') return g * 1000
    return null
  }

  // Helper to convert from ml to target volume unit
  const fromMlTo = (ml: number, u: string) => {
    if (u === 'l') return ml / 1000
    if (u === 'ml') return ml
    return null
  }

  // 1. Check if both are mass units
  const massInGrams = getMassInGrams(quantity, fromUnit)
  if (massInGrams !== null) {
    const convertedMass = fromGramsTo(massInGrams, toUnit)
    if (convertedMass !== null) return convertedMass

    // If toUnit is 'pcs' and we have piece conversion info
    if (toUnit === 'pcs' && pcQuantity && pcUnit) {
      const pcUnitInGrams = getMassInGrams(1, pcUnit)
      if (pcUnitInGrams !== null) {
        // Find how many grams is one piece
        const gramsPerPiece = pcQuantity * pcUnitInGrams
        return massInGrams / gramsPerPiece
      }
    }
  }

  // 2. Check if both are volume units
  const volumeInMl = getVolumeInMl(quantity, fromUnit)
  if (volumeInMl !== null) {
    const convertedVolume = fromMlTo(volumeInMl, toUnit)
    if (convertedVolume !== null) return convertedVolume

    // If toUnit is 'pcs' and we have piece conversion info
    if (toUnit === 'pcs' && pcQuantity && pcUnit) {
      const pcUnitInMl = getVolumeInMl(1, pcUnit)
      if (pcUnitInMl !== null) {
        // Find how many ml is one piece
        const mlPerPiece = pcQuantity * pcUnitInMl
        return volumeInMl / mlPerPiece
      }
    }
  }

  // 3. Check if fromUnit is 'pcs' and we need to convert to mass or volume
  if (fromUnit === 'pcs' && pcQuantity && pcUnit) {
    // Calculate total amount in pcUnit
    const totalInPcUnit = quantity * pcQuantity
    
    // Now recursively convert from pcUnit to toUnit
    return convertQuantity(totalInPcUnit, pcUnit, toUnit)
  }

  // If we can't convert (e.g., mismatched types without piece conversion, or unsupported units), 
  // return the original quantity as a fallback.
  return quantity
}
