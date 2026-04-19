import { useState, useCallback } from 'react'
import { notifications } from '@mantine/notifications'

export interface PhotoDTO {
  data?: string
  url?: string
}

export const usePhotoUpload = () => {
  const [photo, setPhoto] = useState<PhotoDTO | null>(null)

  const handlePhotoUpload = useCallback((file: File | null) => {
    if (!file) {
      setPhoto(null)
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      notifications.show({
        title: 'File Too Large',
        message: 'Image must be less than 2MB',
        color: 'red',
      })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPhoto({ data: reader.result as string })
    }
    reader.readAsDataURL(file)
  }, [])

  const resetPhoto = useCallback(() => {
    setPhoto(null)
  }, [])

  return { photo, handlePhotoUpload, resetPhoto }
}
