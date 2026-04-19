import { useState } from 'react'
import { PhotoUpload, type PhotoDTO } from '../../components/PhotoUpload'
import {
  Title,
  Text,
  Button,
  Group,
  Stack,
  ActionIcon,
  Modal,
  TextInput,
  Select,
  Image,
  rem,
  Pagination,
  LoadingOverlay,
  Box,
  Avatar,
  Timeline,
  Paper,
  Badge,
  Center,
  Table,
  NumberInput,
  Divider,
  ScrollArea,
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
  IconHistory,
  IconBuildingStore,
  IconActivity,
} from '@tabler/icons-react'
import {
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
  fetchCategories,
  fetchItemPriceHistory,
  fetchNutritionEntries,
  fetchAllNutrients,
  upsertNutritionEntry,
  deleteNutritionEntry,
  type ApiError,
} from '../../services/api'
import type { ShoppingItem, NutritionEntry } from '../../services/api'
import { getPhotoSrc } from '../../utils/photo'

export function ShoppingItemsPage() {
  const queryClient = useQueryClient()
  const [activePage, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [opened, { open, close }] = useDisclosure(false)
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null)

  const [nutritionOpened, { open: openNutrition, close: closeNutrition }] = useDisclosure(false)
  const [selectedNutritionItem, setSelectedNutritionItem] = useState<ShoppingItem | null>(null)

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
    queryFn: () =>
      selectedHistoryItem ? fetchItemPriceHistory(selectedHistoryItem.id) : Promise.resolve([]),
    enabled: !!selectedHistoryItem,
  })

  const form = useForm({
    initialValues: {
      name: '',
      photo: null as PhotoDTO | null,
      unit: 'pcs',
      pcQuantity: 1,
      pcUnit: 'kg',
      nutritionSampleSize: 100,
      nutritionSampleUnit: 'g',
      categoryId: '',
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must have at least 2 characters' : null),
      unit: (value) => (!value ? 'Unit is required' : null),
      categoryId: (value) => (!value ? 'Category is required' : null),
      nutritionSampleSize: (v) => (v <= 0 ? 'Sample size must be positive' : null),
      pcQuantity: (v, values) => (values.unit === 'pcs' && (!v || v <= 0) ? 'Piece quantity must be positive' : null),
      pcUnit: (v, values) => (values.unit === 'pcs' && !v ? 'Piece unit is required' : null),
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
    onError: (error: ApiError) => {
      notifications.show({
        title: 'Error',
        message: error.data?.detail || 'Failed to create item',
        color: 'red',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, item }: { id: number; item: Partial<ShoppingItem> }) => updateItem(id, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] })
      notifications.show({ title: 'Success', message: 'Item updated successfully', color: 'green' });
      // Invalidate related lists too
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      close()
      setEditingItem(null)
      form.reset()
    },
    onError: (error: ApiError) => {
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
    onError: () => {
      notifications.show({ title: 'Error', message: 'Failed to delete item', color: 'red' })
    },
  })
  const handleEdit = (item: ShoppingItem) => {
    setEditingItem(item)
    // Store photo as PhotoDTO with url for reads, data only when user uploads new photo
    const photoDto: PhotoDTO | null = item.photo?.url ? { url: item.photo.url } : null
    form.setValues({
      name: item.name,
      photo: photoDto,
      unit: item.unit || 'pcs',
      pcQuantity: item.pcQuantity || 1,
      pcUnit: item.pcUnit || 'kg',
      nutritionSampleSize: item.nutritionSampleSize || 100,
      nutritionSampleUnit: item.nutritionSampleUnit || 'g',
      categoryId: item.category.id.toString(),
    })
    open()
  }

  const handleShowHistory = (item: ShoppingItem) => {
    setSelectedHistoryItem(item)
    openHistory()
  }

  const handleSubmit = (values: typeof form.values) => {
    const selectedCategory = categoriesData?._embedded?.categories?.find(
      (cat) => cat.id === parseInt(values.categoryId),
    )
    // Only send photo if user uploaded a new photo (data field)
    // If editing and no new photo, don't include photo in payload to preserve existing
    const photoPayload = values.photo?.data
      ? { data: String(values.photo.data) }
      : undefined
    const payload = {
      name: String(values.name),
      photo: photoPayload,
      unit: String(values.unit),
      pcQuantity: values.unit === 'pcs' ? Number(values.pcQuantity) : undefined,
      pcUnit: values.unit === 'pcs' ? String(values.pcUnit) : undefined,
      nutritionSampleSize: Number(values.nutritionSampleSize),
      nutritionSampleUnit: String(values.nutritionSampleUnit),
      category: selectedCategory || { id: parseInt(values.categoryId), name: '', icon: '' },
    }
    console.log('Item payload:', payload)
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, item: payload as any })
    } else {
      createMutation.mutate(payload as any)
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

  const unitOptions = [
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'g', label: 'Grams (g)' },
    { value: 'l', label: 'Liters (l)' },
    { value: 'ml', label: 'Milliliters (ml)' },
    { value: 'pack', label: 'Pack' },
    { value: 'box', label: 'Box' },
    { value: 'bottle', label: 'Bottle' },
    { value: 'can', label: 'Can' },
  ]

  const rows = items
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    .map((item) => (
      <Table.Tr key={item.id}>
        <Table.Td>
          <Group gap="sm">
            <Box
              w={32}
              h={32}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {item.photo ? (
                <Image src={getPhotoSrc(item.photo)} fit="contain" h={32} w={32} />
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
          <Badge variant="outline">{item.unit}</Badge>
        </Table.Td>
        <Table.Td>
          <Group gap="xs" justify="flex-end">
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => {
                setSelectedNutritionItem(item)
                openNutrition()
              }}
              title="Nutrition Data"
            >
              <IconActivity style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="indigo"
              onClick={() => handleShowHistory(item)}
              title="Price History"
            >
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
          <Text c="dimmed" size="sm">
            Manage master list of items for your shopping lists
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={18} />}
          onClick={() => {
            setEditingItem(null)
            form.reset()
            open()
          }}
        >
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
                <Table.Th>Unit</Table.Th>
                <Table.Th style={{ width: rem(140) }} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? (
                rows
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text ta="center" py="xl" c="dimmed">
                      No items found
                    </Text>
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
            
            <Select
              required
              label="Default Unit"
              placeholder="Select unit"
              data={unitOptions}
              searchable
              comboboxProps={{ withinPortal: true, zIndex: 3000 }}
              {...form.getInputProps('unit')}
            />

            {form.values.unit === 'pcs' && (
              <>
                <Divider label="Piece Conversion" labelPosition="center" />
                <Text size="xs" c="dimmed">
                  Define the standard quantity and unit represented by 1 piece (e.g. 1 pc = 1 L).
                </Text>
                <Group grow>
                  <NumberInput
                    required
                    label="Quantity per Piece"
                    min={0.01}
                    decimalScale={4}
                    {...form.getInputProps('pcQuantity')}
                  />
                  <Select
                    required
                    label="Piece Unit"
                    data={unitOptions.filter((u) => u.value !== 'pcs')}
                    searchable
                    comboboxProps={{ withinPortal: true, zIndex: 3000 }}
                    {...form.getInputProps('pcUnit')}
                  />
                </Group>
              </>
            )}

            <Divider label="Nutrition Calculation Context" labelPosition="center" />
            <Text size="xs" c="dimmed">
              Define the portion size used for nutritional values (e.g. 100kcal per 100g).
            </Text>

            <Group grow>
              <NumberInput
                required
                label="Sample Size"
                min={0.1}
                decimalScale={2}
                {...form.getInputProps('nutritionSampleSize')}
              />
              <Select
                required
                label="Sample Unit"
                data={unitOptions}
                searchable
                comboboxProps={{ withinPortal: true, zIndex: 3000 }}
                {...form.getInputProps('nutritionSampleUnit')}
              />
            </Group>

            <Divider label="Item Photo" labelPosition="center" />

            <PhotoUpload
              photo={form.values.photo || undefined}
              onChange={(photo) => form.setFieldValue('photo', photo)}
              label=""
              description=""
              size={64}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={close}>
                Cancel
              </Button>
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
        onClose={() => {
          closeHistory()
          setSelectedHistoryItem(null)
        }}
        title={`Price History: ${selectedHistoryItem?.name}`}
        radius="md"
        size="lg"
        zIndex={2000}
      >
        <Box pos="relative" mih={200}>
          <LoadingOverlay visible={historyLoading} />

          {priceHistory && priceHistory.length > 0 ? (
            <Timeline active={0} bulletSize={24} lineWidth={2}>
              {priceHistory.map((entry) => (
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

      <NutritionModal
        opened={nutritionOpened}
        onClose={() => {
          closeNutrition()
          setSelectedNutritionItem(null)
        }}
        item={selectedNutritionItem}
      />
    </Stack>
  )
}

interface NutritionModalProps {
  opened: boolean
  onClose: () => void
  item: ShoppingItem | null
}

function NutritionModal({ opened, onClose, item }: NutritionModalProps) {
  const queryClient = useQueryClient()
  
  const { data: allNutrients } = useQuery({
    queryKey: ['nutrients-master'],
    queryFn: fetchAllNutrients,
    enabled: opened,
  })

  const { data: nutrition, isLoading } = useQuery({
    queryKey: ['item-nutrition', item?.id],
    queryFn: () => (item ? fetchNutritionEntries(item.id) : Promise.resolve([])),
    enabled: !!item && opened,
  })

  const upsertMutation = useMutation({
    mutationFn: (entry: Partial<NutritionEntry>) => upsertNutritionEntry(item!.id, entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-nutrition', item?.id] })
      notifications.show({ title: 'Success', message: 'Nutrition data updated', color: 'green' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (nutrientId: number) => deleteNutritionEntry(item!.id, nutrientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-nutrition', item?.id] })
      notifications.show({ title: 'Success', message: 'Nutrient removed', color: 'green' })
    },
  })

  const nutritionForm = useForm({
    initialValues: {
      nutrientId: '' as string | number,
      value: 0,
    },
    validate: {
      nutrientId: (v) => (!v ? 'Select a nutrient' : null),
    },
  })

  const handleAddNutrient = (values: typeof nutritionForm.values) => {
    const nutrientId = Number(values.nutrientId)
    const selectedNutrient = allNutrients?.find(n => n.id === nutrientId)
    if (!selectedNutrient) {
      notifications.show({ title: 'Error', message: 'Invalid nutrient selected', color: 'red' })
      return
    }
    const payload = {
      nutrient: {
        id: selectedNutrient.id,
        name: selectedNutrient.name,
        unit: selectedNutrient.unit,
      },
      value: Number(values.value),
    }
    console.log('Nutrition payload:', payload)
    upsertMutation.mutate(payload as any)
    nutritionForm.reset()
  }

  const selectedNutrientData = allNutrients?.find(n => String(n.id) === String(nutritionForm.values.nutrientId))

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={item ? `Nutrition: ${item.name}` : 'Nutrition Data'}
      radius="md"
      size="md"
      zIndex={2000}
    >
      <Stack gap="md">
        <Paper withBorder p="sm" bg="blue.0">
          <Text size="sm" fw={500} c="blue.9">
            Provide nutritional values per <strong>{item?.nutritionSampleSize} {item?.nutritionSampleUnit}</strong>.
          </Text>
        </Paper>

        <Paper withBorder p="sm" bg="gray.0">
          <form onSubmit={nutritionForm.onSubmit(handleAddNutrient)}>
            <Stack gap="xs">
              <Group grow align="flex-end">
                <Select
                  label="Nutrient"
                  placeholder="Select definition"
                  data={allNutrients?.map(n => ({ value: String(n.id), label: n.name })) || []}
                  searchable
                  required
                  comboboxProps={{ zIndex: 5000 }}
                  {...nutritionForm.getInputProps('nutrientId')}
                />
                <Group grow gap="xs">
                  <NumberInput
                    label="Value"
                    min={0}
                    decimalScale={2}
                    required
                    {...nutritionForm.getInputProps('value')}
                  />
                  <TextInput
                    label="Unit"
                    readOnly
                    variant="filled"
                    value={selectedNutrientData?.unit || '-'}
                  />
                </Group>
              </Group>
              <Button 
                type="submit" 
                variant="light" 
                leftSection={<IconPlus size={16} />}
                loading={upsertMutation.isPending}
              >
                Add / Update Nutrient
              </Button>
            </Stack>
          </form>
        </Paper>

        <ScrollArea.Autosize mah={200} type="auto">
          <Box pos="relative" mih={100}>
            <LoadingOverlay visible={isLoading} />
            
            {nutrition && nutrition.length > 0 ? (
              <Table verticalSpacing="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Nutrient</Table.Th>
                    <Table.Th w={100}>Value</Table.Th>
                    <Table.Th w={50}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {nutrition.map((entry) => (
                    <Table.Tr key={entry.nutrient.id}>
                      <Table.Td>
                        <Text size="sm" fw={500}>{entry.nutrient.name}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{entry.value} {entry.nutrient.unit}</Text>
                      </Table.Td>
                      <Table.Td>
                        <ActionIcon 
                          variant="subtle" 
                          color="red" 
                          onClick={() => deleteMutation.mutate(entry.nutrient.id)}
                          loading={deleteMutation.isPending && deleteMutation.variables === entry.nutrient.id}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            ) : !isLoading && (
              <Center py="xl">
                <Text c="dimmed" size="sm">No nutrition data recorded yet.</Text>
              </Center>
            )}
          </Box>
        </ScrollArea.Autosize>

        <Group justify="flex-end" mt="md">
          <Button onClick={onClose}>Done</Button>
        </Group>
      </Stack>
    </Modal>
  )
}
