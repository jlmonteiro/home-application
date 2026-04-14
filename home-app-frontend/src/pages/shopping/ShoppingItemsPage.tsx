import { useState } from 'react'
import {
  Title,
  Text,
  Button,
  Group,
  Stack,
  Table,
  ActionIcon,
  Modal,
  TextInput,
  Select,
  rem,
  Pagination,
  LoadingOverlay,
  Box,
  Avatar,
  FileButton,
  Image,
  Timeline,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconSearch, 
  IconBasket, 
  IconUpload, 
  IconHistory, 
  IconBuildingStore,
  IconArrowRight
} from '@tabler/icons-react'
import { 
  fetchItems, 
  createItem, 
  updateItem, 
  deleteItem, 
  fetchCategories,
  fetchItemPriceHistory
} from '../../services/api'
import type { ShoppingItem, ShoppingItemPriceHistory } from '../../services/api'

/**
 * Helper to determine the correct image source for item photos.
 * Handles direct URLs and Base64 strings (with or without prefixes).
 */
const getPhotoSrc = (photo: string | undefined | null) => {
  if (!photo) return null
  if (photo.startsWith('http') || photo.startsWith('data:image')) return photo
  return `data:image/png;base64,${photo}`
}

export function ShoppingItemsPage() {
  const queryClient = useQueryClient()
  const [activePage, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [opened, { open, close }] = useDisclosure(false)
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null)
  
  const [historyOpened, { open: openHistory, close: closeHistory }] = useDisclosure(false)
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ShoppingItem | null>(null)

  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ['shopping-items', activePage],
    queryFn: () => fetchItems(activePage - 1),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['shopping-categories-all'],
    queryFn: () => fetchCategories(0, 100),
  })

  const { data: priceHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['price-history', selectedHistoryItem?.id],
    queryFn: () => fetchItemPriceHistory(selectedHistoryItem!.id),
    enabled: !!selectedHistoryItem,
  })

  const form = useForm({
    initialValues: {
      name: '',
      photo: '',
      categoryId: '',
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must have at least 2 characters' : null),
      categoryId: (value) => (!value ? 'Category is required' : null),
    },
  })

  const handleFileUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        form.setFieldValue('photo', base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const createMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] })
      notifications.show({ title: 'Success', message: 'Item created successfully', color: 'green' })
      close()
      form.reset()
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.data?.detail || 'Failed to create item',
        color: 'red',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, item }: { id: number; item: Partial<ShoppingItem> }) =>
      updateItem(id, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] })
      notifications.show({ title: 'Success', message: 'Item updated successfully', color: 'green' })
      close()
      setEditingItem(null)
      form.reset()
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.data?.detail || 'Failed to update item',
        color: 'red',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] })
      notifications.show({ title: 'Success', message: 'Item deleted successfully', color: 'green' })
    },
    onError: (_error: any) => {
      notifications.show({ title: 'Error', message: 'Failed to delete item', color: 'red' })
    },
  })

  const handleEdit = (item: ShoppingItem) => {
    setEditingItem(item)
    form.setValues({
      name: item.name,
      photo: item.photo || '',
      categoryId: item.category.id.toString(),
    })
    open()
  }

  const handleShowHistory = (item: ShoppingItem) => {
    setSelectedHistoryItem(item)
    openHistory()
  }

  const handleSubmit = (values: typeof form.values) => {
    const selectedCategory = categoriesData?._embedded?.categories
      ?.find(cat => cat.id === parseInt(values.categoryId))
    const payload = {
      name: values.name,
      photo: values.photo,
      category: selectedCategory || { id: parseInt(values.categoryId), name: '', icon: '' }
    }
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, item: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(id)
    }
  }

  const items = itemsData?._embedded?.items || []
  const categoryOptions = (categoriesData?._embedded?.categories || []).map((cat) => ({
    value: cat.id.toString(),
    label: cat.name,
  }))

  const rows = items
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    .map((item) => (
      <Table.Tr key={item.id}>
        <Table.Td>
          <Group gap="sm">
            <Box w={32} h={32} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {item.photo ? (
                <Image 
                  src={getPhotoSrc(item.photo)} 
                  fit="contain" 
                  h={32} 
                  w={32} 
                />
              ) : (
                <Avatar radius="sm" size="sm">
                  <IconBasket size={16} />
                </Avatar>
              )}
            </Box>
            <Text fw={500}>{item.name}</Text>
          </Group>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{item.category.name}</Text>
        </Table.Td>
        <Table.Td>
          <Group gap="xs" justify="flex-end">
            <ActionIcon variant="light" color="indigo" onClick={() => handleShowHistory(item)} title="Price History">
              <IconHistory style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
            </ActionIcon>
            <ActionIcon variant="light" color="blue" onClick={() => handleEdit(item)}>
              <IconEdit style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
            </ActionIcon>
            <ActionIcon variant="light" color="red" onClick={() => handleDelete(item.id)}>
              <IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
            </ActionIcon>
          </Group>
        </Table.Td>
      </Table.Tr>
    ))

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>Shopping Items</Title>
          <Text c="dimmed" size="sm">Manage master list of items for your shopping lists</Text>
        </div>
        <Button leftSection={<IconPlus size={18} />} onClick={() => { setEditingItem(null); form.reset(); open(); }}>
          Add Item
        </Button>
      </Group>

      <Box pos="relative">
        <LoadingOverlay visible={itemsLoading} overlayProps={{ blur: 2 }} />
        
        <Stack gap="md">
          <TextInput
            placeholder="Search items..."
            leftSection={<IconSearch size={16} stroke={1.5} />}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />

          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Item</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th style={{ width: rem(140) }} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? rows : (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Text ta="center" py="xl" c="dimmed">No items found</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>

          {itemsData && itemsData.page.totalPages > 1 && (
            <Group justify="center">
              <Pagination total={itemsData.page.totalPages} value={activePage} onChange={setPage} />
            </Group>
          )}
        </Stack>
      </Box>

      {/* Edit/Add Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={editingItem ? 'Edit Item' : 'Add Item'}
        radius="md"
        zIndex={2000}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              required
              label="Name"
              placeholder="e.g. Milk, Bread, Apples"
              {...form.getInputProps('name')}
            />
            <Select
              required
              label="Category"
              placeholder="Select category"
              data={categoryOptions}
              searchable
              nothingFoundMessage="No categories found"
              comboboxProps={{ withinPortal: true, zIndex: 3000 }}
              {...form.getInputProps('categoryId')}
            />
            
            <Group align="flex-end">
              <Box w={64} h={64} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--mantine-color-gray-3)', borderRadius: rem(4), overflow: 'hidden' }}>
                {form.values.photo ? (
                  <Image 
                    src={getPhotoSrc(form.values.photo)} 
                    fit="contain" 
                    h={64} 
                    w={64} 
                  />
                ) : (
                  <IconBasket size={32} stroke={1.5} color="var(--mantine-color-gray-4)" />
                )}
              </Box>
              <FileButton onChange={handleFileUpload} accept="image/png,image/jpeg">
                {(props) => (
                  <Button {...props} variant="light" leftSection={<IconUpload size={16} />}>
                    Upload Photo
                  </Button>
                )}
              </FileButton>
              {form.values.photo && (
                <Button variant="subtle" color="red" size="xs" onClick={() => form.setFieldValue('photo', '')}>
                  Remove
                </Button>
              )}
            </Group>

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={close}>Cancel</Button>
              <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                {editingItem ? 'Save Changes' : 'Create Item'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Price History Modal */}
      <Modal
        opened={historyOpened}
        onClose={() => { closeHistory(); setSelectedHistoryItem(null); }}
        title={`Price History: ${selectedHistoryItem?.name}`}
        radius="md"
        size="lg"
        zIndex={2000}
      >
        <Box pos="relative" minH={200}>
          <LoadingOverlay visible={historyLoading} />
          
          {priceHistory && priceHistory.length > 0 ? (
            <Timeline active={0} bulletSize={24} lineWidth={2}>
              {priceHistory.map((entry) => (
                <Timeline.Item 
                  key={entry.id} 
                  bullet={<IconBuildingStore size={14} />} 
                  title={
                    <Group justify="space-between">
                      <Text fw={700} size="lg">€{entry.price.toFixed(2)}</Text>
                      <Text size="xs" c="dimmed">
                        {new Date(entry.recordedAt).toLocaleDateString()} {new Date(entry.recordedAt).toLocaleTimeString()}
                      </Text>
                    </Group>
                  }
                >
                  <Text size="sm" c="dimmed">
                    Recorded at <Text span fw={500} c="dark">{entry.storeName || 'Any Store'}</Text>
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
    </Stack>
  )
}
