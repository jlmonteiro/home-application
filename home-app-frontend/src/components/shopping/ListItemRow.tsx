import {
  Group,
  Box,
  Stack,
  Text,
  Checkbox,
  ActionIcon,
  Avatar,
  Image,
} from '@mantine/core'
import {
  IconBasket,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconCircleX,
  IconCheck,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react'
import type { ShoppingListItem } from '../../services/api'

interface PriceTrendIconProps {
  item: ShoppingListItem
  onClick: () => void
}

function PriceTrendIcon({ item, onClick }: PriceTrendIconProps) {
  const price = item.pricing?.price
  const previousPrice = item.pricing?.previousPrice
  
  if (price === null || previousPrice === null || price === undefined || previousPrice === undefined) return null

  if (price > previousPrice) {
    return (
      <ActionIcon variant="subtle" color="red" size="sm" onClick={onClick} title="Price Increased">
        <IconTrendingUp size={16} />
      </ActionIcon>
    )
  }

  if (price < previousPrice) {
    return (
      <ActionIcon variant="subtle" color="green" size="sm" onClick={onClick} title="Price Decreased">
        <IconTrendingDown size={16} />
      </ActionIcon>
    )
  }

  return (
    <ActionIcon variant="subtle" color="gray" size="sm" onClick={onClick} title="Price Same">
      <IconMinus size={16} />
    </ActionIcon>
  )
}

interface ListItemRowProps {
  item: ShoppingListItem
  listStatus: string
  onToggleBought: (id: number, bought: boolean) => void
  onEdit: (item: ShoppingListItem) => void
  onRemove: (id: number) => void
  onMarkUnavailable: (id: number, unavailable: boolean) => void
  onShowHistory: (item: ShoppingListItem) => void
  onPreviewImage: (url: string, title: string) => void
}

export function ListItemRow({
  item,
  listStatus,
  onToggleBought,
  onEdit,
  onRemove,
  onMarkUnavailable,
  onShowHistory,
  onPreviewImage,
}: ListItemRowProps) {
  const photoSrc = item.item.photo?.url

  return (
    <Group
      key={item.id}
      wrap="nowrap"
      gap="sm"
      style={{ opacity: item.bought ? 0.5 : 1, minHeight: 56 }}
    >
      <Checkbox
        checked={item.bought}
        onChange={(e) => onToggleBought(item.id, e.currentTarget.checked)}
        disabled={listStatus === 'COMPLETED' || item.unavailable}
        size="lg"
        radius="md"
        styles={{ input: { cursor: 'pointer', minWidth: 24, minHeight: 24 } }}
      />

      <Box style={{ flex: 1 }}>
        <Group gap="xs" wrap="nowrap">
          <Box
            w={24}
            h={24}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: photoSrc ? 'pointer' : 'default',
            }}
            onClick={() => {
              if (photoSrc) onPreviewImage(photoSrc, item.item.name)
            }}
          >
            {photoSrc ? (
              <Image src={photoSrc} fit="contain" h={24} w={24} />
            ) : (
              <Avatar radius="sm" size={24}>
                <IconBasket size={14} />
              </Avatar>
            )}
          </Box>
          <Stack gap={0} style={{ overflow: 'hidden' }}>
            <Group gap={4} wrap="nowrap">
              <Text fw={500} size="sm" td={item.bought ? 'line-through' : 'none'} truncate>
                {item.item.name}
              </Text>
              <PriceTrendIcon item={item} onClick={() => onShowHistory(item)} />
            </Group>
            <Text size="xs" c="dimmed">
              {item.quantity} {item.unit} • €{(item.pricing?.price || 0).toFixed(2)}
            </Text>
          </Stack>
        </Group>
      </Box>

      <Group gap={4} wrap="nowrap">
        {!item.bought && !item.unavailable && listStatus === 'PENDING' && (
          <ActionIcon
            variant="subtle"
            color="orange"
            size="sm"
            onClick={() => onMarkUnavailable(item.id, true)}
            title="Mark as unavailable"
          >
            <IconCircleX size={16} />
          </ActionIcon>
        )}
        {item.unavailable && listStatus === 'PENDING' && (
          <ActionIcon
            variant="subtle"
            color="green"
            size="sm"
            onClick={() => onMarkUnavailable(item.id, false)}
            title="Mark as available"
          >
            <IconCheck size={16} />
          </ActionIcon>
        )}
        <ActionIcon variant="subtle" color="blue" size="sm" onClick={() => onEdit(item)}>
          <IconEdit size={16} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="red"
          size="sm"
          onClick={() => {
            if (window.confirm('Remove this item?')) onRemove(item.id)
          }}
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Group>
    </Group>
  )
}