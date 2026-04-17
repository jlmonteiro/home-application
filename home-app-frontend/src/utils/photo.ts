/**
 * Determine the correct image source for photos.
 * Handles direct URLs, data URIs, and base64 strings.
 */
export const getPhotoSrc = (photo: string | undefined | null): string | null => {
  if (!photo) return null
  
  // Direct URLs or already prefixed data URIs
  if (photo.startsWith('http') || photo.startsWith('data:image')) return photo
  
  // Heuristic for relative paths (e.g., /logos/store.png)
  // Paths typically have file extensions and are not extremely long
  if (photo.startsWith('/') && photo.includes('.') && photo.length < 500) {
    return photo
  }
  
  // Handle common base64 headers if missing
  if (photo.startsWith('/9j/')) {
    return `data:image/jpeg;base64,${photo}`
  }
  
  if (photo.startsWith('iVBORw0KGgo')) {
    return `data:image/png;base64,${photo}`
  }

  // Default fallback for other base64 strings
  return `data:image/png;base64,${photo}`
}
