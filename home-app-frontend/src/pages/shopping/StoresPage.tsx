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
  Image,
  Badge,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { Link } from 'react-router-dom'
import * as TablerIcons from '@tabler/icons-react'
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconQuestionMark,
  IconExternalLink,
  IconArrowRight,
  IconTicket,
} from '@tabler/icons-react'
import { fetchStores, createStore, updateStore, deleteStore } from '../../services/api'
import type { ShoppingStore } from '../../services/api'

/**
 * Helper to determine the correct image source for store logos.
 * Handles direct URLs and Base64 strings (with or without prefixes).
 */
const getPhotoSrc = (photo: string | undefined | null) => {
  if (!photo) return null
  if (photo.startsWith('http') || photo.startsWith('data:image') || photo.startsWith('/logos/'))
    return photo
  // Fallback for raw base64 data
  return `data:image/png;base64,${photo}`
}

export function StoresPage() {
  const queryClient = useQueryClient()
  const [activePage, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [opened, { open, close }] = useDisclosure(false)
  const [editingStore, setEditingStore] = useState<ShoppingStore | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['shopping-stores', activePage],
    queryFn: () => fetchStores(activePage - 1),
  })

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      icon: 'IconBuildingStore',
      photo: '',
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must have at least 2 characters' : null),
    },
  })

  const createMutation = useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-stores'] })
      notifications.show({
        title: 'Success',
        message: 'Store created successfully',
        color: 'green',
      })
      close()
      form.reset()
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.data?.detail || 'Failed to create store',
        color: 'red',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, store }: { id: number; store: Partial<ShoppingStore> }) =>
      updateStore(id, store),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-stores'] })
      notifications.show({
        title: 'Success',
        message: 'Store updated successfully',
        color: 'green',
      })
      close()
      setEditingStore(null)
      form.reset()
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.data?.detail || 'Failed to update store',
        color: 'red',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-stores'] })
      notifications.show({
        title: 'Success',
        message: 'Store deleted successfully',
        color: 'green',
      })
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Failed to delete store', color: 'red' })
    },
  })

  const handleEdit = (store: ShoppingStore) => {
    setEditingStore(store)
    form.setValues({
      name: store.name,
      description: store.description || '',
      icon: store.icon || 'IconBuildingStore',
      photo: store.photo || '',
    })
    open()
  }

  const handleSubmit = (values: typeof form.values) => {
    if (editingStore) {
      updateMutation.mutate({ id: editingStore.id, store: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const handleDelete = (id: number) => {
    if (
      window.confirm(
        'Are you sure you want to delete this store? All linked loyalty cards and coupons will be removed.',
      )
    ) {
      deleteMutation.mutate(id)
    }
  }

  const stores = data?._embedded?.stores || []

  // Live preview Section
  const SelectedIcon = useMemo(() => {
    return (TablerIcons as any)[form.values.icon] || IconQuestionMark
  }, [form.values.icon])

  const rows = stores
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    .map((store) => {
      const IconComponent =
        (TablerIcons as any)[store.icon || 'IconBuildingStore'] || IconQuestionMark
      return (
        <Table.Tr key={store.id}>
          <Table.Td>
            <Group gap="sm">
              <Box
                w={48}
                h={48}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {store.photo ? (
                  <Image src={getPhotoSrc(store.photo)} fit="contain" h={48} w={48} />
                ) : (
                  <Box
                    bg="gray.0"
                    w="100%"
                    h="100%"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: rem(4),
                    }}
                  >
                    <IconComponent
                      size={24}
                      stroke={1.5}
                      color="var(--mantine-color-indigo-filled)"
                    />
                  </Box>
                )}
              </Box>
              <div>
                <Group gap="xs" align="center">
                  <Text fw={500}>{store.name}</Text>
                  {store.validCouponsCount && store.validCouponsCount > 0 ? (
                    <Badge
                      color="green"
                      variant="light"
                      size="sm"
                      leftSection={<IconTicket size={12} />}
                    >
                      {store.validCouponsCount}{' '}
                      {store.validCouponsCount === 1 ? 'coupon' : 'coupons'}
                    </Badge>
                  ) : null}
                </Group>
                <Text size="xs" c="dimmed" lineClamp={1}>
                  {store.description}
                </Text>
              </div>
            </Group>
          </Table.Td>
          <Table.Td>
            <Group gap="xs" justify="flex-end">
              <Button
                variant="light"
                size="xs"
                component={Link}
                to={`/shopping/stores/${store.id}`}
                rightSection={<IconArrowRight size={14} />}
              >
                Explore
              </Button>
              <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(store)}>
                <IconEdit style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
              </ActionIcon>
              <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(store.id)}>
                <IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
              </ActionIcon>
            </Group>
          </Table.Td>
        </Table.Tr>
      )
    })

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>Shopping Stores</Title>
          <Text c="dimmed" size="sm">
            Manage your favorite stores, loyalty cards, and coupons
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={18} />}
          onClick={() => {
            setEditingStore(null)
            form.reset()
            open()
          }}
        >
          Add Store
        </Button>
      </Group>

      <Box pos="relative">
        <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />

        <Stack gap="md">
          <TextInput
            placeholder="Search stores..."
            leftSection={<IconSearch size={16} stroke={1.5} />}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />

          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Store</Table.Th>
                <Table.Th style={{ width: rem(200) }} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? (
                rows
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={2}>
                    <Text ta="center" py="xl" c="dimmed">
                      No stores found. Start by adding one!
                    </Text>
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
        title={editingStore ? 'Edit Store' : 'Add Store'}
        radius="md"
        zIndex={2000}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              required
              label="Name"
              placeholder="e.g. Walmart, Carrefour"
              {...form.getInputProps('name')}
            />

            <Group align="flex-end">
              <Box
                w={80}
                h={80}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--mantine-color-gray-3)',
                  borderRadius: rem(4),
                  overflow: 'hidden',
                }}
              >
                {form.values.photo ? (
                  <Image src={getPhotoSrc(form.values.photo)} fit="contain" h={80} w={80} />
                ) : (
                  <SelectedIcon size={40} stroke={1.5} color="var(--mantine-color-gray-4)" />
                )}
              </Box>
              <TextInput
                label="Photo URL"
                placeholder="/logos/tesco.svg or https://..."
                style={{ flex: 1 }}
                {...form.getInputProps('photo')}
              />
            </Group>

            <TextInput
              label="Icon Fallback"
              placeholder="e.g. IconBuildingStore"
              leftSection={<SelectedIcon size={18} stroke={1.5} />}
              {...form.getInputProps('icon')}
            />
            <Text size="xs" c="dimmed" mt={-10}>
              <Anchor href="https://tabler.io/icons" target="_blank" size="xs">
                View icon options <IconExternalLink size={10} />
              </Anchor>
            </Text>

            <Textarea
              label="Description"
              placeholder="Store location or notes"
              {...form.getInputProps('description')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                {editingStore ? 'Save Changes' : 'Create Store'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  )
}
