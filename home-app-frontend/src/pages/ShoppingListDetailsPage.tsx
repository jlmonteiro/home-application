import { useState, useEffect } from 'react'
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
  LoadingOverlay,
  Box,
  Paper,
  NumberInput,
  Checkbox,
  Divider,
  Combobox,
  useCombobox,
  Avatar,
  Badge,
  FileButton,
  Image,
  Textarea,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { useParams, Link } from 'react-router-dom'
import { 
  IconPlus, 
  IconTrash, 
  IconBasket, 
  IconArrowLeft,
  IconCheck,
  IconCalculator,
  IconUpload,
  IconEdit
} from '@tabler/icons-react'
import { 
  fetchList, 
  fetchItems, 
  addItemToList, 
  updateListItem, 
  removeListItem, 
  fetchSuggestedPrice,
  updateList,
  fetchStores,
  createItem,
  fetchCategories
} from '../services/api'
import type { ShoppingList, ShoppingListItem, ShoppingStore } from '../services/api'
import { MarkdownContent } from '../components/MarkdownContent'

/**
 * Helper to determine the correct image source for item photos.
 */
const getPhotoSrc = (photo: string | undefined | null) => {
  if (!photo) return null
  if (photo.startsWith('http') || photo.startsWith('data:image')) return photo
  return `data:image/png;base64,${photo}`
}

export function ShoppingListDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const listId = parseInt(id!)
  const queryClient = useQueryClient()
  
  const [itemSearch, setItemSearch] = useState('')
  const [addItemOpened, { open: openAddItem, close: closeAddItem }] = useDisclosure(false)
  const [createItemOpened, { open: openCreateItem, close: closeCreateItem }] = useDisclosure(false)
  const [editListOpened, { open: openEditList, close: closeEditList }] = useDisclosure(false)
  const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null)
  const [editItemOpened, { open: openEditItem, close: closeEditItem }] = useDisclosure(false)

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

  // Mutations
  const addItemMutation = useMutation({
    mutationFn: (values: any) => addItemToList(listId, {
      ...values,
      itemId: parseInt(values.itemId),
      storeId: values.storeId ? parseInt(values.storeId) : null
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', listId] })
      notifications.show({ title: 'Success', message: 'Item added', color: 'green' })
      closeAddItem()
      addItemForm.reset()
      setItemSearch('')
    }
  })

  const createItemMutation = useMutation({
    mutationFn: createItem,
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items-all'] })
      notifications.show({ title: 'Success', message: 'Master item created', color: 'green' })
      // Auto-select the new item in the add form
      addItemForm.setFieldValue('itemId', newItem.id.toString())
      setItemSearch(newItem.name)
      closeCreateItem()
      createItemForm.reset()
    },
    onError: (error: any) => {
      notifications.show({ title: 'Error', message: error.data?.detail || 'Failed to create item', color: 'red' })
    }
  })

  const updateListMutation = useMutation({
    mutationFn: (data: Partial<ShoppingList>) => updateList(listId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', listId] })
      notifications.show({ title: 'Success', message: 'List updated', color: 'green' })
      closeEditList()
    }
  })

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ShoppingListItem> }) => updateListItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', listId] })
      if (editItemOpened) {
        notifications.show({ title: 'Success', message: 'Item updated', color: 'green' })
        closeEditItem()
        setEditingItem(null)
      }
    }
  })

  const removeItemMutation = useMutation({
    mutationFn: removeListItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', listId] })
      notifications.show({ title: 'Success', message: 'Item removed', color: 'green' })
    }
  })

  // Forms
  const addItemForm = useForm({
    initialValues: {
      itemId: '',
      storeId: '',
      quantity: 1,
      unit: 'pcs',
      price: undefined as number | undefined,
    },
    validate: {
      itemId: (v) => (!v ? 'Select an item' : null),
    },
  })

  const editItemForm = useForm({
    initialValues: {
      storeId: '',
      quantity: 1,
      unit: 'pcs',
      price: 0 as number | undefined,
    },
  })

  const createItemForm = useForm({
    initialValues: {
      name: '',
      categoryId: '',
      photo: '',
    },
    validate: {
      name: (v) => (!v ? 'Name is required' : null),
      categoryId: (v) => (!v ? 'Category is required' : null),
    },
  })

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
  const handlePhotoUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => createItemForm.setFieldValue('photo', e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

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
    createItemForm.setFieldValue('name', itemSearch)
    openCreateItem()
    combobox.closeDropdown()
  }

  const handleEditItem = (item: ShoppingListItem) => {
    setEditingItem(item)
    editItemForm.setValues({
      storeId: item.storeId?.toString() || '',
      quantity: item.quantity,
      unit: item.unit,
      price: item.price || 0,
    })
    openEditItem()
  }

  // Fetch suggested price when item or store changes
  useEffect(() => {
    if (addItemForm.values.itemId) {
      const storeId = addItemForm.values.storeId ? parseInt(addItemForm.values.storeId) : undefined
      fetchSuggestedPrice(parseInt(addItemForm.values.itemId), storeId)
        .then(price => {
          if (price) addItemForm.setFieldValue('price', price)
        })
    }
  }, [addItemForm.values.itemId, addItemForm.values.storeId])

  const masterItems = masterItemsData?._embedded?.items || []
  const filteredMasterItems = masterItems.filter(item => 
    item.name.toLowerCase().includes(itemSearch.toLowerCase())
  )

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

  const totalEstimated = list?.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0) || 0
  const boughtItemsCount = list?.items.filter(i => i.bought).length || 0

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
              <Button 
                variant="light" 
                leftSection={<IconEdit size={16} />} 
                onClick={handleEditList}
              >
                Edit Info
              </Button>
              <Button 
                color="green" 
                leftSection={<IconCheck size={16} />}
                onClick={() => {
                  if (window.confirm('Mark this list as completed?')) updateListMutation.mutate({ status: 'COMPLETED' })
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
                <Text size="sm" c="dimmed">Created by {list.creatorName}</Text>
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
                  <Text fw={700} size="xl">€{totalEstimated.toFixed(2)}</Text>
                </Group>
                <Text size="xs" c="dimmed">Estimated Total</Text>
              </Stack>
            </Paper>
          </Group>
        </Stack>
      </Paper>

      <Paper withBorder radius="md" p="md">
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={3}>Items ({boughtItemsCount}/{list.items.length})</Title>
            {list.status === 'PENDING' && (
              <Button leftSection={<IconPlus size={16} />} onClick={openAddItem}>Add Item</Button>
            )}
          </Group>

          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: rem(40) }}></Table.Th>
                <Table.Th>Item</Table.Th>
                <Table.Th>Store</Table.Th>
                <Table.Th>Qty</Table.Th>
                <Table.Th>Price</Table.Th>
                <Table.Th>Total</Table.Th>
                <Table.Th style={{ width: rem(100) }}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {list.items.map((item) => (
                <Table.Tr key={item.id} style={{ opacity: item.bought ? 0.6 : 1 }}>
                  <Table.Td>
                    <Checkbox 
                      checked={item.bought} 
                      onChange={(e) => updateItemMutation.mutate({ id: item.id, data: { bought: e.currentTarget.checked } })}
                      disabled={list.status === 'COMPLETED'}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Group gap="sm">
                      <Box w={32} h={32} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {item.itemPhoto ? (
                          <Image src={getPhotoSrc(item.itemPhoto)} fit="contain" h={32} w={32} />
                        ) : (
                          <Avatar radius="sm" size="sm"><IconBasket size={16} /></Avatar>
                        )}
                      </Box>
                      <Text fw={500} td={item.bought ? 'line-through' : 'none'}>{item.itemName}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    {item.storeName ? (
                      <Badge variant="dot" color="gray" size="sm">
                        {item.storeName}
                      </Badge>
                    ) : (
                      <Text size="xs" c="dimmed italic">Any</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{item.quantity} {item.unit}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">€{(item.price || 0).toFixed(2)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={700}>€{((item.price || 0) * item.quantity).toFixed(2)}</Text>
                  </Table.Td>
                  <Table.Td>
                    {list.status === 'PENDING' && (
                      <Group gap={4} wrap="nowrap">
                        <ActionIcon variant="subtle" color="blue" onClick={() => handleEditItem(item)}>
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="red" onClick={() => {
                          if (window.confirm('Remove this item?')) removeItemMutation.mutate(item.id)
                        }}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
              {list.items.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Text ta="center" py="xl" c="dimmed">Your list is empty. Add some items to start planning!</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      {/* Add Item Modal */}
      <Modal opened={addItemOpened} onClose={closeAddItem} title="Add Item to List" radius="md" zIndex={2000}>
        <form onSubmit={addItemForm.onSubmit((v) => addItemMutation.mutate(v))}>
          <Stack gap="md">
            <Combobox
              store={combobox}
              withinPortal={true}
              onOptionSubmit={(val) => {
                if (val === 'CREATE_NEW') {
                  handleOpenCreateItem()
                } else {
                  addItemForm.setFieldValue('itemId', val)
                  const selected = masterItems.find(i => i.id.toString() === val)
                  if (selected) setItemSearch(selected.name)
                }
                combobox.closeDropdown()
              }}
            >
              <Combobox.Target>
                <TextInput
                  label="Search Item"
                  placeholder="Type to search..."
                  value={itemSearch}
                  onChange={(event) => {
                    setItemSearch(event.currentTarget.value)
                    combobox.openDropdown()
                    combobox.updateSelectedOptionIndex()
                  }}
                  onClick={() => combobox.openDropdown()}
                  onFocus={() => combobox.openDropdown()}
                  onBlur={() => {
                    combobox.closeDropdown()
                    const selected = masterItems.find(i => i.id.toString() === addItemForm.values.itemId)
                    if (selected) setItemSearch(selected.name)
                  }}
                  required
                  error={addItemForm.errors.itemId}
                />
              </Combobox.Target>

              <Combobox.Dropdown style={{ zIndex: 3000 }}>
                <Combobox.Options>
                  {filteredMasterItems.length > 0 ? (
                    <>
                      {filteredMasterItems.map((item) => (
                        <Combobox.Option value={item.id.toString()} key={item.id}>
                          <Group gap="sm">
                            <Box w={24} h={24} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {item.photo ? (
                                <Image src={getPhotoSrc(item.photo)} fit="contain" h={24} w={24} />
                              ) : (
                                <IconBasket size={14} />
                              )}
                            </Box>
                            <Text size="sm">{item.name}</Text>
                          </Group>
                        </Combobox.Option>
                      ))}
                      <Divider my="xs" />
                      <Combobox.Option value="CREATE_NEW">
                        <Group gap="xs">
                          <IconPlus size={14} color="blue" />
                          <Text size="sm" c="blue" fw={500}>Create "{itemSearch || 'New Item'}"</Text>
                        </Group>
                      </Combobox.Option>
                    </>
                  ) : (
                    <>
                      <Combobox.Option value="CREATE_NEW">
                        <Group gap="xs">
                          <IconPlus size={14} color="blue" />
                          <Text size="sm" c="blue" fw={500}>Create "{itemSearch || 'New Item'}"</Text>
                        </Group>
                      </Combobox.Option>
                      <Combobox.Empty>No items found</Combobox.Empty>
                    </>
                  )}
                </Combobox.Options>
              </Combobox.Dropdown>
            </Combobox>

            {/* Visual fallback button if nothing is selected */}
            {!addItemForm.values.itemId && itemSearch.length > 0 && filteredMasterItems.length === 0 && (
              <Button 
                variant="light" 
                size="xs" 
                leftSection={<IconPlus size={14} />}
                onClick={handleOpenCreateItem}
              >
                Create "{itemSearch}" master item
              </Button>
            )}

            <Select 
              label="Store (Optional)" 
              placeholder="Where to buy?"
              data={storeOptions}
              searchable
              clearable
              comboboxProps={{ withinPortal: true, zIndex: 3000 }}
              {...addItemForm.getInputProps('storeId')}
            />

            <Group grow>
              <NumberInput 
                label="Quantity" 
                min={0.1} 
                step={0.1}
                {...addItemForm.getInputProps('quantity')} 
              />
              <Select 
                label="Unit" 
                data={['pcs', 'kg', 'g', 'L', 'ml', 'pack', 'bottle']} 
                comboboxProps={{ withinPortal: true, zIndex: 3000 }}
                {...addItemForm.getInputProps('unit')} 
              />
            </Group>

            <NumberInput 
              label="Price per Unit (€)" 
              placeholder="Suggested price will load if available"
              min={0}
              decimalScale={2}
              {...addItemForm.getInputProps('price')}
            />

            <Button type="submit" mt="md" loading={addItemMutation.isPending}>Add Item to List</Button>
          </Stack>
        </form>
      </Modal>

      {/* Edit Item Modal */}
      <Modal opened={editItemOpened} onClose={closeEditItem} title={`Edit ${editingItem?.itemName}`} radius="md" zIndex={2000}>
        <form onSubmit={editItemForm.onSubmit((v) => updateItemMutation.mutate({
          id: editingItem!.id,
          data: {
            ...v,
            storeId: v.storeId ? parseInt(v.storeId) : null
          }
        }))}>
          <Stack gap="md">
            <Select 
              label="Store (Optional)" 
              placeholder="Where to buy?"
              data={storeOptions}
              searchable
              clearable
              comboboxProps={{ withinPortal: true, zIndex: 3000 }}
              {...editItemForm.getInputProps('storeId')}
            />

            <Group grow>
              <NumberInput 
                label="Quantity" 
                min={0.1} 
                step={0.1}
                {...editItemForm.getInputProps('quantity')} 
              />
              <Select 
                label="Unit" 
                data={['pcs', 'kg', 'g', 'L', 'ml', 'pack', 'bottle']} 
                comboboxProps={{ withinPortal: true, zIndex: 3000 }}
                {...editItemForm.getInputProps('unit')} 
              />
            </Group>

            <NumberInput 
              label="Price per Unit (€)" 
              min={0}
              decimalScale={2}
              {...editItemForm.getInputProps('price')}
            />

            <Button type="submit" mt="md" loading={updateItemMutation.isPending}>Save Changes</Button>
          </Stack>
        </form>
      </Modal>

      {/* Create New Item Modal (Nested) */}
      <Modal opened={createItemOpened} onClose={closeCreateItem} title="Create New Master Item" radius="md" zIndex={4000}>
        <form onSubmit={createItemForm.onSubmit((v) => createItemMutation.mutate({
          ...v,
          categoryId: parseInt(v.categoryId)
        }))}>
          <Stack gap="md">
            <TextInput required label="Item Name" {...createItemForm.getInputProps('name')} />
            <Select 
              required 
              label="Category" 
              placeholder="Select category"
              data={categoryOptions}
              searchable
              comboboxProps={{ withinPortal: true, zIndex: 5000 }}
              {...createItemForm.getInputProps('categoryId')}
            />
            
            <Group align="flex-end">
              <Box w={64} h={64} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--mantine-color-gray-3)', borderRadius: rem(4), overflow: 'hidden' }}>
                {createItemForm.values.photo ? (
                  <Image src={getPhotoSrc(createItemForm.values.photo)} fit="contain" h={64} w={64} />
                ) : (
                  <IconBasket size={32} stroke={1.5} color="var(--mantine-color-gray-4)" />
                )}
              </Box>
              <FileButton onChange={handlePhotoUpload} accept="image/png,image/jpeg">
                {(props) => (
                  <Button {...props} variant="light" leftSection={<IconUpload size={16} />}>
                    Upload Photo
                  </Button>
                )}
              </FileButton>
            </Group>

            <Button type="submit" mt="md" loading={createItemMutation.isPending}>Create and Select</Button>
          </Stack>
        </form>
      </Modal>

      {/* Edit List Modal */}
      <Modal opened={editListOpened} onClose={closeEditList} title="Edit List Info" radius="md" zIndex={2000}>
        <form onSubmit={listForm.onSubmit((v) => updateListMutation.mutate(v))}>
          <Stack gap="md">
            <TextInput required label="List Name" {...listForm.getInputProps('name')} />
            <Textarea 
              label="Description" 
              placeholder="Markdown supported" 
              minRows={6}
              {...listForm.getInputProps('description')} 
            />
            <Button type="submit" mt="md" loading={updateListMutation.isPending}>Save Changes</Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  )
}
