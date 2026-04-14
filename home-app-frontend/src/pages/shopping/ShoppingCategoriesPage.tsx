import { useState, useMemo } from 'react'
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
  Textarea,
  rem,
  Pagination,
  LoadingOverlay,
  Box,
  Anchor,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import * as TablerIcons from '@tabler/icons-react'
import { IconPlus, IconEdit, IconTrash, IconSearch, IconQuestionMark, IconExternalLink } from '@tabler/icons-react'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../services/api'
import type { ShoppingCategory } from '../../services/api'

export function ShoppingCategoriesPage() {
  const queryClient = useQueryClient()
  const [activePage, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [opened, { open, close }] = useDisclosure(false)
  const [editingCategory, setEditingCategory] = useState<ShoppingCategory | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['shopping-categories', activePage],
    queryFn: () => fetchCategories(activePage - 1),
  })

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      icon: 'IconShoppingCart',
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must have at least 2 characters' : null),
      icon: (value) => (!value ? 'Icon name is required' : null),
    },
  })

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-categories'] })
      notifications.show({ title: 'Success', message: 'Category created successfully', color: 'green' })
      close()
      form.reset()
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.data?.detail || 'Failed to create category',
        color: 'red',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, category }: { id: number; category: Partial<ShoppingCategory> }) =>
      updateCategory(id, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-categories'] })
      notifications.show({ title: 'Success', message: 'Category updated successfully', color: 'green' })
      close()
      setEditingCategory(null)
      form.reset()
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.data?.detail || 'Failed to update category',
        color: 'red',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-categories'] })
      notifications.show({ title: 'Success', message: 'Category deleted successfully', color: 'green' })
    },
    onError: (_error: any) => {
      notifications.show({ title: 'Error', message: 'Failed to delete category', color: 'red' })
    },
  })

  const handleEdit = (category: ShoppingCategory) => {
    setEditingCategory(category)
    form.setValues({
      name: category.name,
      description: category.description || '',
      icon: category.icon || 'IconShoppingCart',
    })
    open()
  }

  const handleSubmit = (values: typeof form.values) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, category: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this category? This will also delete all items in it.')) {
      deleteMutation.mutate(id)
    }
  }

  const categories = data?._embedded?.categories || []

  const rows = categories
    .filter((cat) => cat.name.toLowerCase().includes(search.toLowerCase()))
    .map((category) => {
      const IconComponent = (category.icon ? (TablerIcons as any)[category.icon] : null) || IconQuestionMark
      return (
        <Table.Tr key={category.id}>
          <Table.Td>
            <Group gap="sm">
              <Box 
                w={32} 
                h={32} 
                bg="gray.1" 
                style={{ borderRadius: rem(4), display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <IconComponent size={18} stroke={1.5} color="var(--mantine-color-indigo-filled)" />
              </Box>
              <Text fw={500}>{category.name}</Text>
            </Group>
          </Table.Td>
          <Table.Td>{category.description || <Text c="dimmed" size="xs">No description</Text>}</Table.Td>
          <Table.Td>
            <Group gap="xs" justify="flex-end">
              <ActionIcon variant="light" color="blue" onClick={() => handleEdit(category)}>
                <IconEdit style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
              </ActionIcon>
              <ActionIcon variant="light" color="red" onClick={() => handleDelete(category.id)}>
                <IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
              </ActionIcon>
            </Group>
          </Table.Td>
        </Table.Tr>
      )
    })

  // Live preview of the typed icon name
  const SelectedIcon = useMemo(() => {
    return (TablerIcons as any)[form.values.icon] || IconQuestionMark
  }, [form.values.icon])

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>Shopping Categories</Title>
          <Text c="dimmed" size="sm">Manage categories to organize your shopping items</Text>
        </div>
        <Button leftSection={<IconPlus size={18} />} onClick={() => { setEditingCategory(null); form.reset(); open(); }}>
          Add Category
        </Button>
      </Group>

      <Box pos="relative">
        <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />
        
        <Stack gap="md">
          <TextInput
            placeholder="Search categories..."
            leftSection={<IconSearch size={16} stroke={1.5} />}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />

          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th style={{ width: rem(100) }} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? rows : (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Text ta="center" py="xl" c="dimmed">No categories found</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>

          {data && data.page.totalPages > 1 && (
            <Group justify="center">
              <Pagination total={data.page.totalPages} value={activePage} onChange={setPage} />
            </Group>
          )}
        </Stack>
      </Box>

      <Modal
        opened={opened}
        onClose={close}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        radius="md"
        zIndex={2000}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              required
              label="Name"
              placeholder="e.g. Groceries, Pharmacy"
              {...form.getInputProps('name')}
            />
            
            <Stack gap={4}>
              <TextInput
                label="Category Icon"
                placeholder="e.g. IconApple, IconBasket"
                leftSection={<SelectedIcon size={18} stroke={1.5} />}
                {...form.getInputProps('icon')}
              />
              <Text size="xs" c="dimmed">
                Find icon names at{' '}
                <Anchor href="https://tabler.io/icons" target="_blank" size="xs">
                  tabler.io/icons <IconExternalLink size={10} style={{ verticalAlign: 'middle' }} />
                </Anchor>
                . Remember to include 'Icon' prefix (e.g., IconFish).
              </Text>
            </Stack>

            <Textarea
              label="Description"
              placeholder="Brief description of what goes in this category"
              {...form.getInputProps('description')}
            />
            
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={close}>Cancel</Button>
              <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  )
}
