/**
 * Determine the correct image source for photos.
 * Handles direct URLs, data URIs, and base64 strings.
 */
export const getPhotoSrc = (photo: string | undefined | null): string | null => {
  if (!photo) return null
  if (photo.startsWith('http') || photo.startsWith('data:image')) return photo
  if (photo.startsWith('/')) return photo
  return `data:image/png;base64,${photo}`
}