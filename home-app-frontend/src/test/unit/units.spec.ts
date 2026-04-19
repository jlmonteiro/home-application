import { describe, it, expect } from 'vitest'
import { convertQuantity } from '../../utils/units'

describe('convertQuantity', () => {
  describe('Basic Conversions', () => {
    it('returns original quantity if units are the same', () => {
      expect(convertQuantity(100, 'g', 'g')).toBe(100)
      expect(convertQuantity(1.5, 'l', 'l')).toBe(1.5)
      expect(convertQuantity(10, 'pcs', 'pcs')).toBe(10)
    })

    it('converts mass units correctly', () => {
      expect(convertQuantity(1, 'kg', 'g')).toBe(1000)
      expect(convertQuantity(500, 'g', 'kg')).toBe(0.5)
      expect(convertQuantity(1, 'g', 'mg')).toBe(1000)
      expect(convertQuantity(1000, 'mg', 'g')).toBe(1)
      expect(convertQuantity(1, 'kg', 'mg')).toBe(1000000)
    })

    it('converts volume units correctly', () => {
      expect(convertQuantity(1, 'l', 'ml')).toBe(1000)
      expect(convertQuantity(500, 'ml', 'l')).toBe(0.5)
      expect(convertQuantity(2.5, 'l', 'ml')).toBe(2500)
    })

    it('returns original quantity for mismatched types without conversion info', () => {
      expect(convertQuantity(100, 'g', 'ml')).toBe(100)
      expect(convertQuantity(1, 'l', 'kg')).toBe(1)
      expect(convertQuantity(10, 'pcs', 'g')).toBe(10)
    })

    it('returns original quantity for unsupported units', () => {
      expect(convertQuantity(10, 'oz', 'g')).toBe(10)
      expect(convertQuantity(5, 'g', 'cups')).toBe(5)
    })
  })

  describe('Piece (pcs) Conversions', () => {
    it('converts mass to pieces (pcs) using pcQuantity and pcUnit', () => {
      // 1 piece = 200g. 1kg = 1000g. 1000g / 200g = 5 pieces.
      expect(convertQuantity(1, 'kg', 'pcs', 200, 'g')).toBe(5)
      // 1 piece = 0.5kg. 2000g = 2kg. 2kg / 0.5kg = 4 pieces.
      expect(convertQuantity(2000, 'g', 'pcs', 0.5, 'kg')).toBe(4)
    })

    it('converts volume to pieces (pcs) using pcQuantity and pcUnit', () => {
      // 1 piece = 250ml. 1l = 1000ml. 1000ml / 250ml = 4 pieces.
      expect(convertQuantity(1, 'l', 'pcs', 250, 'ml')).toBe(4)
      // 1 piece = 0.2l. 1000ml = 1l. 1l / 0.2l = 5 pieces.
      expect(convertQuantity(1000, 'ml', 'pcs', 0.2, 'l')).toBe(5)
    })

    it('converts pieces (pcs) to mass using pcQuantity and pcUnit', () => {
      // 5 pieces, each 200g. Total = 1000g = 1kg.
      expect(convertQuantity(5, 'pcs', 'kg', 200, 'g')).toBe(1)
      // 2 pieces, each 0.5kg. Total = 1kg = 1000g.
      expect(convertQuantity(2, 'pcs', 'g', 0.5, 'kg')).toBe(1000)
    })

    it('converts pieces (pcs) to volume using pcQuantity and pcUnit', () => {
      // 4 pieces, each 250ml. Total = 1000ml = 1l.
      expect(convertQuantity(4, 'pcs', 'l', 250, 'ml')).toBe(1)
      // 10 pieces, each 0.1l. Total = 1l = 1000ml.
      expect(convertQuantity(10, 'pcs', 'ml', 0.1, 'l')).toBe(1000)
    })

    it('returns original quantity if pcs conversion is requested but info is missing', () => {
      expect(convertQuantity(10, 'pcs', 'g')).toBe(10)
      expect(convertQuantity(500, 'g', 'pcs')).toBe(500)
    })
  })
})
