import { describe, it, expect } from 'vitest'
import { getPhotoSrc } from '../../utils/photo'
import { formatEuro } from '../../utils/currency'

describe('getPhotoSrc', () => {
  it('returns null for empty/undefined values', () => {
    expect(getPhotoSrc(null)).toBeNull()
    expect(getPhotoSrc(undefined)).toBeNull()
  })

  it('returns http URLs as-is', () => {
    expect(getPhotoSrc('https://example.com/photo.jpg')).toBe('https://example.com/photo.jpg')
  })

  it('returns data URIs as-is', () => {
    const dataUri = 'data:image/png;base64,abc123'
    expect(getPhotoSrc(dataUri)).toBe(dataUri)
  })

  it('returns relative paths starting with / as-is', () => {
    expect(getPhotoSrc('/images/photo.png')).toBe('/images/photo.png')
  })

  it('prepends data:image/png;base64, to plain base64 strings', () => {
    expect(getPhotoSrc('abc123')).toBe('data:image/png;base64,abc123')
  })
})

describe('formatEuro', () => {
  it('returns empty string for null/undefined', () => {
    expect(formatEuro(null)).toBe('')
    expect(formatEuro(undefined)).toBe('')
  })

  it('returns value as-is if already prefixed with €', () => {
    expect(formatEuro('€5.00')).toBe('€5.00')
  })

  it('prepends € to plain values', () => {
    expect(formatEuro('5.00')).toBe('€5.00')
    expect(formatEuro('10')).toBe('€10')
  })
})