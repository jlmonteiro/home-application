import { useState, useCallback } from 'react'
import {
  Box,
  Image,
  FileButton,
  Button,
  ActionIcon,
  Group,
  Text,
  rem,
} from '@mantine/core'
import { IconUpload, IconTrash } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { getPhotoSrc } from '../utils/photo'

export interface PhotoDTO {
  data?: string
  url?: string
}

interface PhotoUploadProps {
  photo?: PhotoDTO
  onChange: (photo: PhotoDTO | null) => void
  label?: string
  description?: string
  size?: number
}

export function PhotoUpload({
  photo,
  onChange,
  description = 'Upload a photo to identify this item visually.',
  size = 64,
}: PhotoUploadProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleFileUpload = useCallback(
    (file: File | null) => {
      if (!file) {
        onChange(null)
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
      reader.onload = () => {
        onChange({ data: reader.result as string })
      }
      reader.readAsDataURL(file)
    },
    [onChange]
  )

  const handleRemove = useCallback(() => {
    onChange(null)
  }, [onChange])

  const photoSrc = getPhotoSrc(photo)

  return (
    <>
      <Group align="flex-end">
        <Box
          w={size}
          h={size}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--mantine-color-gray-3)',
            borderRadius: rem(4),
            overflow: 'hidden',
            position: 'relative',
            cursor: 'pointer',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {photoSrc ? (
            <>
              <Image src={photoSrc} fit="contain" h={size} w={size} />
              <ActionIcon
                variant="filled"
                color="red"
                size="sm"
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.2s',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </>
          ) : (
            <IconUpload size={size * 0.6} stroke={1.5} color="var(--mantine-color-gray-4)" />
          )}
        </Box>
        {/* Only show upload button if no photo exists */}
        {!photo && (
          <FileButton onChange={handleFileUpload} accept="image/png,image/jpeg,image/svg+xml">
            {(props) => (
              <Button {...props} variant="light" leftSection={<IconUpload size={16} />}>
                Upload Photo
              </Button>
            )}
          </FileButton>
        )}
      </Group>
      <Text size="xs" c="dimmed">
        {description}
      </Text>
    </>
  )
}
