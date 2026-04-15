import { useState, useEffect, useMemo } from 'react'
import {
  Modal,
  Stack,
  TextInput,
  Select,
  NumberInput,
  Group,
  Combobox,
  Box,
  Image,
  Text,
  Divider,
  Button,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useCombobox } from '@mantine/core'
import { IconPlus, IconBasket } from '@tabler/icons-react'
import type { ShoppingItem, ShoppingStore } from '../../services/api'
import { getPhotoSrc } from '../../utils/photo'
import { fetchSuggestedPrice } from '../../services/api'

interface AddItemModalProps {
  opened: boolean
  onClose: () => void
  masterItems: ShoppingItem[]
  storeOptions: { value: string; label: string }[]
  onSubmit: (values: AddItemFormValues) => void
  onCreateNew: (searchTerm: string) => void
  isPending: boolean
}

export interface AddItemFormValues {
  itemId: string
  storeId: string
  quantity: number
  unit: string
  price: number | undefined
}

export function AddItemModal({
  opened,
  onClose,
  masterItems,
  storeOptions,
  onSubmit,
  onCreateNew,
  isPending,
}: AddItemModalProps) {
  const [itemSearch, setItemSearch] = useState('')
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  const form = useForm({
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

  const filteredMasterItems = useMemo(
    () => masterItems.filter((item) => item.name.toLowerCase().includes(itemSearch.toLowerCase())),
    [masterItems, itemSearch],
  )

  // Fetch suggested price when item or store changes
  useEffect(() => {
    if (form.values.itemId) {
      const storeId = form.values.storeId ? parseInt(form.values.storeId) : undefined
      fetchSuggestedPrice(parseInt(form.values.itemId), storeId).then((price) => {
        if (price) form.setFieldValue('price', price)
      })
    }
  }, [form.values.itemId, form.values.storeId])

  const handleOptionSubmit = (val: string) => {
    if (val === 'CREATE_NEW') {
      onCreateNew(itemSearch)
    } else {
      form.setFieldValue('itemId', val)
      const selected = masterItems.find((i) => i.id.toString() === val)
      if (selected) setItemSearch(selected.name)
    }
    combobox.closeDropdown()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add Item to List" radius="md" zIndex={2000}>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <Combobox
            store={combobox}
            withinPortal={true}
            onOptionSubmit={handleOptionSubmit}
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
                  const selected = masterItems.find(
                    (i) => i.id.toString() === form.values.itemId,
                  )
                  if (selected) setItemSearch(selected.name)
                }}
                required
                error={form.errors.itemId}
              />
            </Combobox.Target>

            <Combobox.Dropdown style={{ zIndex: 3000 }}>
              <Combobox.Options>
                {filteredMasterItems.length > 0 ? (
                  <>
                    {filteredMasterItems.map((item) => (
                      <Combobox.Option value={item.id.toString()} key={item.id}>
                        <Group gap="sm">
                          <Box
                            w={24}
                            h={24}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
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
                        <Text size="sm" c="blue" fw={500}>
                          Create "{itemSearch || 'New Item'}"
                        </Text>
                      </Group>
                    </Combobox.Option>
                  </>
                ) : (
                  <>
                    <Combobox.Option value="CREATE_NEW">
                      <Group gap="xs">
                        <IconPlus size={14} color="blue" />
                        <Text size="sm" c="blue" fw={500}>
                          Create "{itemSearch || 'New Item'}"
                        </Text>
                      </Group>
                    </Combobox.Option>
                    <Combobox.Empty>No items found</Combobox.Empty>
                  </>
                )}
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>

          {!form.values.itemId && itemSearch.length > 0 && filteredMasterItems.length === 0 && (
            <Button
              variant="light"
              size="xs"
              leftSection={<IconPlus size={14} />}
              onClick={() => onCreateNew(itemSearch)}
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
            {...form.getInputProps('storeId')}
          />

          <Group grow>
            <NumberInput
              label="Quantity"
              min={0.1}
              step={0.1}
              {...form.getInputProps('quantity')}
            />
            <Select
              label="Unit"
              data={['pcs', 'kg', 'g', 'L', 'ml', 'pack', 'bottle']}
              comboboxProps={{ withinPortal: true, zIndex: 3000 }}
              {...form.getInputProps('unit')}
            />
          </Group>

          <NumberInput
            label="Price per Unit (€)"
            placeholder="Suggested price will load if available"
            min={0}
            decimalScale={2}
            {...form.getInputProps('price')}
          />

          <Button type="submit" mt="md" loading={isPending}>
            Add Item to List
          </Button>
        </Stack>
      </form>
    </Modal>
  )
}