import { Modal, Box, LoadingOverlay, Timeline, Text, Group, Stack } from '@mantine/core'
import { IconBuildingStore, IconHistory } from '@tabler/icons-react'
import type { ShoppingItemPriceHistory } from '../../services/api'

interface PriceHistoryModalProps {
  opened: boolean
  onClose: () => void
  itemName: string | null
  history: ShoppingItemPriceHistory[] | null | undefined
  isLoading: boolean
}

export function PriceHistoryModal({
  opened,
  onClose,
  itemName,
  history,
  isLoading,
}: PriceHistoryModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Price History: ${itemName || ''}`}
      radius="md"
      size="lg"
      zIndex={2000}
    >
      <Box pos="relative" mih={200}>
        <LoadingOverlay visible={isLoading} />

        {history && history.length > 0 ? (
          <Timeline active={0} bulletSize={24} lineWidth={2}>
            {history.map((entry) => (
              <Timeline.Item
                key={entry.id}
                bullet={<IconBuildingStore size={14} />}
                title={
                  <Group justify="space-between">
                    <Text fw={700} size="lg">
                      €{entry.price.toFixed(2)}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {new Date(entry.recordedAt).toLocaleDateString()}{' '}
                      {new Date(entry.recordedAt).toLocaleTimeString()}
                    </Text>
                  </Group>
                }
              >
                <Text size="sm" c="dimmed">
                  Recorded at{' '}
                  <Text span fw={500} c="dark">
                    {entry.storeName || 'Any Store'}
                  </Text>
                </Text>
              </Timeline.Item>
            ))}
          </Timeline>
        ) : (
          <Stack align="center" py="xl">
            <IconHistory size={48} color="var(--mantine-color-gray-3)" />
            <Text c="dimmed">No price history available for this item yet.</Text>
          </Stack>
        )}
      </Box>
    </Modal>
  )
}