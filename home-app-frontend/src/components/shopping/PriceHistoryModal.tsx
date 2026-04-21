import { Modal, Box, LoadingOverlay, Timeline, Text, Group, Stack, Image } from '@mantine/core'
import { IconBuildingStore, IconHistory } from '@tabler/icons-react'
import type { ShoppingItemPriceHistory } from '../../services/api'
import { getPhotoSrc } from '../../utils/photo'

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
          <Timeline 
            active={0} 
            bulletSize={40} 
            lineWidth={2}
            styles={{
              itemBullet: {
                backgroundColor: 'transparent',
                border: 'none',
              }
            }}
          >
            {history.map((entry) => (
              <Timeline.Item
                key={entry.id}
                bullet={
                  <Box
                    w={40}
                    h={40}
                    bg="white"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      borderRadius: 0, // Ensure square
                      border: '1px solid var(--mantine-color-gray-2)' // Subtle border for white logos on white bg
                    }}
                  >
                    {entry.store?.photo ? (
                      <Image src={getPhotoSrc(entry.store?.photo)} fit="contain" w="100%" h="100%" />
                    ) : (
                      <IconBuildingStore size={22} color="var(--mantine-color-gray-5)" />
                    )}
                  </Box>
                }
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
                    {entry.store?.name || 'Any Store'}
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