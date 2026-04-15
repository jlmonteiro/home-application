import { Modal, Center, Stack, Button, Text, rem } from '@mantine/core'
import { BarcodeDisplay } from './BarcodeDisplay'

interface FullscreenBarcodeModalProps {
  opened: boolean
  onClose: () => void
  data: {
    name: string
    number: string
    barcodeType: string
  } | null
}

export function FullscreenBarcodeModal({ opened, onClose, data }: FullscreenBarcodeModalProps) {
  if (!data) return null

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={data.name}
      fullScreen
      zIndex={3000}
    >
      <Center h="100%" pb={rem(100)}>
        <Stack align="center" gap="xl" w="100%">
          <BarcodeDisplay
            code={data.number}
            type={data.barcodeType as 'QR' | 'CODE_128'}
            size="lg"
            style={{ borderRadius: rem(12), boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}
          />
          <Text size="xl" fw={700} ff="monospace" style={{ letterSpacing: rem(2) }}>
            {data.number}
          </Text>
          <Button size="lg" variant="light" onClick={onClose}>
            Close
          </Button>
        </Stack>
      </Center>
    </Modal>
  )
}
