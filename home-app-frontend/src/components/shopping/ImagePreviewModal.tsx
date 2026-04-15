import { Modal, Center, Image } from '@mantine/core'

interface ImagePreviewModalProps {
  opened: boolean
  onClose: () => void
  url: string | null
  title: string
}

export function ImagePreviewModal({ opened, onClose, url, title }: ImagePreviewModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} size="lg" radius="md" zIndex={6000}>
      <Center pb="xl">
        <Image
          src={url}
          alt={title}
          radius="md"
          style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
        />
      </Center>
    </Modal>
  )
}