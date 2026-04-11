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
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { IconPlus, IconEdit, IconTrash, IconSearch, IconBasket } from '@tabler/icons-react'
import { fetchItems, createItem, updateItem, deleteItem, fetchCategories } from '../services/api'
import type { ShoppingItem } from '../services/api'

export function ShoppingItemsPage() {
  const queryClient = useQueryClient()
  const [activePage, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [opened, { open, close }] = useDisclosure(false)
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null)

  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ['shopping-items', activePage],
    queryFn: () => fetchItems(activePage - 1),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['shopping-categories-all'],
    queryFn: () => fetchCategories(0, 100), // Get first 100 categories for the select
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
      categoryId: item.categoryId.toString(),
    })
    open()
  }

  const handleSubmit = (values: typeof form.values) => {
    const payload = {
      ...values,
      categoryId: parseInt(values.categoryId),
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
            <Avatar src={item.photo} radius="sm" size="sm">
              <IconBasket size={16} />
            </Avatar>
            <Text fw={500}>{item.name}</Text>
          </Group>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{item.categoryName}</Text>
        </Table.Td>
        <Table.Td>
          <Group gap="xs" justify="flex-end">
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
                <Table.Th style={{ width: rem(100) }} />
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

      <Modal
        opened={opened}
        onClose={close}
        title={editingItem ? 'Edit Item' : 'Add Item'}
        radius="md"
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
              {...form.getInputProps('categoryId')}
            />
            <TextInput
              label="Photo URL (optional)"
              placeholder="https://..."
              {...form.getInputProps('photo')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={close}>Cancel</Button>
              <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                {editingItem ? 'Save Changes' : 'Create Item'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  )
}
