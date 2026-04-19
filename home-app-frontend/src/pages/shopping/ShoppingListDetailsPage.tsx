import { useState, useMemo } from 'react'
import {
  Title,
  Text,
  Button,
  Group,
  Stack,
  LoadingOverlay,
  Box,
  Paper,
  Divider,
  Badge,
  Accordion,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useCombobox } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { useParams, Link } from 'react-router-dom'
import {
  IconPlus,
  IconArrowLeft,
  IconCheck,
  IconCalculator,
  IconEdit,
  IconAlertCircle,
  IconBuildingStore,
  IconChevronRight,
} from '@tabler/icons-react'
import {
  fetchList,
  fetchItems,
  addItemToList,
  updateListItem,
  removeListItem,
  updateList,
  fetchStores,
  createItem,
  fetchCategories,
  fetchItemPriceHistory,
  type ApiError,
} from '../../services/api'
import type { ShoppingList, ShoppingListItem, ShoppingStore } from '../../services/api'
import { MarkdownContent } from '../../components/MarkdownContent'
import { ListItemRow } from '../../components/shopping/ListItemRow'
import { EditListModal } from '../../components/shopping/EditListModal'
import { ImagePreviewModal } from '../../components/shopping/ImagePreviewModal'
import { PriceHistoryModal } from '../../components/shopping/PriceHistoryModal'
import { AddItemModal, type AddItemFormValues } from '../../components/shopping/AddItemModal'
import { EditItemModal } from '../../components/shopping/EditItemModal'
import { CreateItemModal } from '../../components/shopping/CreateItemModal'

export function ShoppingListDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const listId = parseInt(id || '0')
  const queryClient = useQueryClient()

  const [addItemOpened, { open: openAddItem, close: closeAddItem }] = useDisclosure(false)
  const [createItemOpened, { open: openCreateItem, close: closeCreateItem }] = useDisclosure(false)
  const [editListOpened, { open: openEditList, close: closeEditList }] = useDisclosure(false)
  const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null)
  const [editItemOpened, { open: openEditItem, close: closeEditItem }] = useDisclosure(false)
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null)
  const [itemSearch, setItemSearch] = useState('')

  const [historyOpened, { open: openHistory, close: closeHistory }] = useDisclosure(false)
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<{
    id: number
    name: string
  } | null>(null)

  // Queries
  const { data: list, isLoading: listLoading } = useQuery({
    queryKey: ['shopping-list', listId],
    queryFn: () => fetchList(listId),
  })

  const { data: masterItemsData } = useQuery({
    queryKey: ['shopping-items-all'],
    queryFn: () => fetchItems(0, 100),
  })

  const { data: storesData } = useQuery({
    queryKey: ['shopping-stores-all'],
    queryFn: () => fetchStores(0, 100),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['shopping-categories-all'],
    queryFn: () => fetchCategories(0, 100),
  })

  const { data: priceHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['price-history', selectedHistoryItem?.id],
    queryFn: () =>
      selectedHistoryItem ? fetchItemPriceHistory(selectedHistoryItem.id) : Promise.resolve([]),
    enabled: !!selectedHistoryItem,
  })

  // Mutations
  const addItemMutation = useMutation({
    mutationFn: (values: AddItemFormValues) => {
      const selectedStore = values.storeId
        ? storesData?._embedded?.stores?.find((s) => s.id === parseInt(values.storeId))
        : null
      return addItemToList(listId, {
        itemId: parseInt(values.itemId),
        quantity: values.quantity,
        unit: values.unit,
        price: values.price,
        store: selectedStore ? { id: selectedStore.id, name: selectedStore.name } : null,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', listId] })
      notifications.show({ title: 'Success', message: 'Item added', color: 'green' })
      closeAddItem()
      setItemSearch('')
    },
  })

  const createItemMutation = useMutation({
    mutationFn: createItem,
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items-all'] })
      notifications.show({ title: 'Success', message: 'Master item created', color: 'green' })
      setItemSearch(newItem.name)
      closeCreateItem()
    },
    onError: (error: ApiError) => {
      notifications.show({
        title: 'Error',
        message: error.data?.detail || 'Failed to create item',
        color: 'red',
      })
    },
  })

  const updateListMutation = useMutation({
    mutationFn: (data: Partial<ShoppingList>) => updateList(listId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', listId] })
      notifications.show({ title: 'Success', message: 'List updated', color: 'green' })
      closeEditList()
    },
  })

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ShoppingListItem> }) =>
      updateListItem(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['shopping-list', listId] })
      const previousList = queryClient.getQueryData(['shopping-list', listId])

      queryClient.setQueryData(['shopping-list', listId], (old: ShoppingList | undefined) => {
        if (!old) return old
        return {
          ...old,
          items: old.items?.map((item: ShoppingListItem) =>
            item.id === id ? { ...item, ...data } : item,
          ),
        }
      })

      return { previousList }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(['shopping-list', listId], context.previousList)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', listId] })
      if (editItemOpened) {
        notifications.show({ title: 'Success', message: 'Item updated', color: 'green' })
        closeEditItem()
        setEditingItem(null)
      }
    },
  })

  const removeItemMutation = useMutation({
    mutationFn: removeListItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', listId] })
      notifications.show({ title: 'Success', message: 'Item removed', color: 'green' })
    },
  })

  // Forms
  const listForm = useForm({
    initialValues: {
      name: '',
      description: '',
    },
    validate: {
      name: (v) => (!v ? 'Name is required' : null),
    },
  })

  // Handlers
  const handleEditList = () => {
    if (list) {
      listForm.setValues({
        name: list.name,
        description: list.description || '',
      })
      openEditList()
    }
  }

  const handleOpenCreateItem = () => {
    openCreateItem()
    combobox.closeDropdown()
  }

  const handleEditItem = (item: ShoppingListItem) => {
    setEditingItem(item)
    openEditItem()
  }

  const handleShowHistory = (item: ShoppingListItem) => {
    setSelectedHistoryItem({ id: item.itemId, name: item.itemName })
    openHistory()
  }

  const masterItems = masterItemsData?._embedded?.items || []

  const storeOptions = (storesData?._embedded?.stores || []).map((store: ShoppingStore) => ({
    value: store.id.toString(),
    label: store.name,
  }))

  const categoryOptions = (categoriesData?._embedded?.categories || []).map((cat) => ({
    value: cat.id.toString(),
    label: cat.name,
  }))

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  // --- Logic for grouping and costs ---

  const groupedItems = useMemo(() => {
    if (!list) return { stores: [], unavailable: [] }

    const unavailable = list.items.filter((i) => i.unavailable)
    const available = list.items.filter((i) => !i.unavailable)

    // 1. Group by Store
    const storesMap = new Map<
      number | string,
      {
        id: number | null
        name: string
        items: ShoppingListItem[]
        cost: number
        isDone: boolean
      }
    >()

    available.forEach((item) => {
      const key = item.store?.id || 'any'
      if (!storesMap.has(key)) {
        storesMap.set(key, {
          id: item.store?.id ?? null,
          name: item.store?.name || 'Any Store',
          items: [],
          cost: 0,
          isDone: false,
        })
      }
      const store = storesMap.get(key)
      if (store) {
        store.items.push(item)
        store.cost += (item.price || 0) * item.quantity
      }
    })

    // 2. For each store, group by Category
    const result = Array.from(storesMap.values()).map((store) => {
      const categoriesMap = new Map<
        string,
        { icon: string; items: ShoppingListItem[]; isDone: boolean }
      >()

      // Initial count to see which categories have > 1 item
      const counts: Record<string, number> = {}
      store.items.forEach((i) => {
        const name = i.category?.name || 'Others'
        counts[name] = (counts[name] || 0) + 1
      })

      store.items.forEach((item) => {
        const rawCatName = item.category?.name || 'Others'
        const isSingleton = counts[rawCatName] === 1
        const catName = isSingleton ? 'Others' : rawCatName

        // If it's Others, use generic basket icon, otherwise use the category icon
        const catIcon = catName === 'Others' ? 'IconBasket' : item.category?.icon || 'IconBasket'

        if (!categoriesMap.has(catName)) {
          categoriesMap.set(catName, { icon: catIcon, items: [], isDone: false })
        }
        const category = categoriesMap.get(catName)
        if (category) {
          category.items.push(item)
        }
      })

      // Check if categories are done
      const categories = Array.from(categoriesMap.entries()).map(([name, data]) => {
        data.isDone = data.items.every((i) => i.bought)
        return { name, ...data }
      })

      store.isDone = store.items.every((i) => i.bought)
      return { ...store, categories }
    })

    return { stores: result, unavailable }
  }, [list])

  const totalEstimated =
    list?.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0) || 0
  const activeItemsCount = list?.items.filter((i) => !i.unavailable).length || 0
  const boughtItemsCount = list?.items.filter((i) => i.bought && !i.unavailable).length || 0

  if (listLoading) return <LoadingOverlay visible />
  if (!list) return <Text>List not found</Text>

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          component={Link}
          to="/shopping/lists"
        >
          Back to Lists
        </Button>
        <Group>
          {list.status === 'PENDING' && (
            <>
              <Button variant="light" leftSection={<IconEdit size={16} />} onClick={handleEditList}>
                Edit Info
              </Button>
              <Button
                color="green"
                leftSection={<IconCheck size={16} />}
                onClick={() => {
                  if (window.confirm('Mark this list as completed?'))
                    updateListMutation.mutate({ status: 'COMPLETED' })
                }}
              >
                Mark Completed
              </Button>
            </>
          )}
        </Group>
      </Group>

      <Paper p="xl" radius="md" withBorder shadow="sm">
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start">
            <Stack gap={4} style={{ flex: 1 }}>
              <Title order={1}>{list.name}</Title>
              <Group gap="xs">
                <Badge variant="light" color={list.status === 'COMPLETED' ? 'green' : 'blue'}>
                  {list.status}
                </Badge>
                <Text size="sm" c="dimmed">
                  Created by {list.creatorName}
                </Text>
              </Group>
              {list.description && (
                <Box mt="xs">
                  <MarkdownContent content={list.description} />
                </Box>
              )}
            </Stack>
            <Paper p="md" withBorder bg="gray.0" radius="md">
              <Stack gap={4} align="flex-end">
                <Group gap="xs">
                  <IconCalculator size={16} color="var(--mantine-color-indigo-6)" />
                  <Text fw={700} size="xl">
                    €{totalEstimated.toFixed(2)}
                  </Text>
                </Group>
                <Text size="xs" c="dimmed">
                  Estimated Total
                </Text>
              </Stack>
            </Paper>
          </Group>
        </Stack>
      </Paper>

      {/* Main Shopping Section */}
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3}>
            Items ({boughtItemsCount}/{activeItemsCount})
          </Title>
          {list.status === 'PENDING' && (
            <Button leftSection={<IconPlus size={16} />} onClick={openAddItem}>
              Add Item
            </Button>
          )}
        </Group>

        {groupedItems.stores.length === 0 && groupedItems.unavailable.length === 0 && (
          <Paper withBorder p="xl" radius="md" bg="gray.0">
            <Text ta="center" c="dimmed">
              Your list is empty. Add some items to start planning!
            </Text>
          </Paper>
        )}

        <Accordion
          multiple
          variant="separated"
          defaultValue={(groupedItems.stores || []).map((s) => s.name)}
        >
          {groupedItems.stores.map((store) => (
            <Accordion.Item key={store.name} value={store.name}>
              <Accordion.Control>
                <Group justify="space-between" pr="md">
                  <Group gap="sm">
                    <IconBuildingStore
                      size={20}
                      color={
                        store.isDone
                          ? 'var(--mantine-color-green-6)'
                          : 'var(--mantine-color-indigo-6)'
                      }
                    />
                    <Text fw={700}>{store.name}</Text>
                    {store.isDone && <IconCheck size={18} color="var(--mantine-color-green-6)" />}
                  </Group>
                  <Badge variant="light" color="indigo" size="lg">
                    €{store.cost.toFixed(2)}
                  </Badge>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="lg" mt="sm">
                  {store.categories.map((category) => (
                    <Box key={category.name}>
                      <Group gap="xs" mb="xs">
                        {category.isDone ? (
                          <IconCheck size={16} color="var(--mantine-color-green-6)" />
                        ) : (
                          <IconChevronRight size={16} color="var(--mantine-color-gray-4)" />
                        )}
                        <Text fw={600} size="sm" c={category.isDone ? 'green' : 'dark'}>
                          {category.name}
                        </Text>
                        <Divider style={{ flex: 1 }} />
                      </Group>
                      <Stack gap="sm" pl="md">
                        {category.items.map((item) => (
                          <ListItemRow
                            key={item.id}
                            item={item}
                            listStatus={list.status}
                            onToggleBought={(id, bought) =>
                              updateItemMutation.mutate({ id, data: { bought } })
                            }
                            onEdit={handleEditItem}
                            onRemove={(id) => {
                              if (window.confirm('Remove this item?'))
                                removeItemMutation.mutate(id)
                            }}
                            onMarkUnavailable={(id, unavailable) =>
                              updateItemMutation.mutate({ id, data: { unavailable } })
                            }
                            onShowHistory={handleShowHistory}
                            onPreviewImage={(url, title) => setPreviewImage({ url, title })}
                          />
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>

        {/* Unavailable Items Section */}
        {groupedItems.unavailable.length > 0 && (
          <Paper
            withBorder
            p="md"
            radius="md"
            bg="orange.0"
            style={{ borderColor: 'var(--mantine-color-orange-3)' }}
          >
            <Stack gap="sm">
              <Group gap="xs">
                <IconAlertCircle size={20} color="var(--mantine-color-orange-6)" />
                <Title order={4} c="orange.9">
                  Unavailable / Plan for alternatives
                </Title>
              </Group>
              <Divider color="orange.2" />
              <Stack gap="sm">
                {groupedItems.unavailable.map((item) => (
                  <ListItemRow
                    key={item.id}
                    item={item}
                    listStatus={list.status}
                    onToggleBought={(id, bought) =>
                      updateItemMutation.mutate({ id, data: { bought } })
                    }
                    onEdit={handleEditItem}
                    onRemove={(id) => {
                      if (window.confirm('Remove this item?'))
                        removeItemMutation.mutate(id)
                    }}
                    onMarkUnavailable={(id, unavailable) =>
                      updateItemMutation.mutate({ id, data: { unavailable } })
                    }
                    onShowHistory={handleShowHistory}
                    onPreviewImage={(url, title) => setPreviewImage({ url, title })}
                  />
                ))}
              </Stack>
            </Stack>
          </Paper>
        )}
      </Stack>

      {/* Add Item Modal */}
      <AddItemModal
        opened={addItemOpened}
        onClose={closeAddItem}
        masterItems={masterItems}
        storeOptions={storeOptions}
        onSubmit={(values) => addItemMutation.mutate(values)}
        onCreateNew={handleOpenCreateItem}
        isPending={addItemMutation.isPending}
      />

      {/* Edit Item Modal */}
      <EditItemModal
        opened={editItemOpened}
        onClose={closeEditItem}
        item={editingItem}
        storeOptions={storeOptions}
        onSubmit={(id, data) => {
          const selectedStore = data.storeId
            ? storesData?._embedded?.stores?.find((s) => s.id === parseInt(data.storeId))
            : null
          updateItemMutation.mutate({
            id,
            data: {
              quantity: data.quantity,
              unit: data.unit,
              price: data.price,
              store: selectedStore ? { id: selectedStore.id, name: selectedStore.name } : null,
            },
          })
        }}
        isPending={updateItemMutation.isPending}
      />

      <CreateItemModal
        opened={createItemOpened}
        onClose={closeCreateItem}
        categoryOptions={categoryOptions}
        initialName={itemSearch}
        onSubmit={(values) => {
          const selectedCategory = categoriesData?._embedded?.categories?.find(
            (cat) => cat.id === parseInt(values.categoryId || '0'),
          )
          createItemMutation.mutate({
            name: values.name,
            photo: values.photo ? { data: values.photo } : null,
            unit: values.unit,
            category: selectedCategory || {
              id: parseInt(values.categoryId || '0'),
              name: '',
              icon: '',
            },
          })
        }}
        isPending={createItemMutation.isPending}
      />

      {/* Edit List Modal */}
      <EditListModal
        opened={editListOpened}
        onClose={closeEditList}
        list={list}
        onSubmit={(data) => updateListMutation.mutate(data)}
        isPending={updateListMutation.isPending}
      />

      {/* Image Preview Modal */}
      <ImagePreviewModal
        opened={!!previewImage}
        onClose={() => setPreviewImage(null)}
        url={previewImage?.url || null}
        title={previewImage?.title || ''}
      />

      {/* Price History Modal */}
      <PriceHistoryModal
        opened={historyOpened}
        onClose={() => {
          closeHistory()
          setSelectedHistoryItem(null)
        }}
        itemName={selectedHistoryItem?.name || null}
        history={priceHistory}
        isLoading={historyLoading}
      />
    </Stack>
  )
}
