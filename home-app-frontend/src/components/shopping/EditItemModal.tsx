import { useEffect } from 'react'
import { Modal, Stack, Select, NumberInput, Group, Button } from '@mantine/core'
import { useForm } from '@mantine/form'
import type { ShoppingListItem, ShoppingStore } from '../../services/api'

interface EditItemModalProps {
  opened: boolean
  onClose: () => void
  item: ShoppingListItem | null
  storeOptions: { value: string; label: string }[]
  onSubmit: (id: number, data: { storeId: string; quantity: number; unit: string; price: number | undefined }) => void
  isPending: boolean
}

export function EditItemModal({
  opened,
  onClose,
  item,
  storeOptions,
  onSubmit,
  isPending,
}: EditItemModalProps) {
  const form = useForm({
    initialValues: {
      storeId: '',
      quantity: 1,
      unit: 'pcs',
      price: '' as string | number,
    },
  })

  // Update form values when item changes
  useEffect(() => {
    if (item) {
      form.setValues({
        storeId: item.store?.id?.toString() || '',
        quantity: item.quantity,
        unit: item.unit,
        price: item.price ?? '',
      })
    } else {
      form.reset()
    }
  }, [item?.id, item?.store?.id, item?.quantity, item?.unit, item?.price])

  const handleSubmit = () => {
    if (item) {
      onSubmit(item.id, form.values)
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={item ? `Edit ${item.itemName}` : 'Edit Item'}
      radius="md"
      zIndex={2000}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Select
            label="Change Store"
            placeholder="Move to a different store"
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
            min={0}
            decimalScale={2}
            {...form.getInputProps('price')}
          />

          <Button type="submit" mt="md" loading={isPending}>
            Save Changes
          </Button>
        </Stack>
      </form>
    </Modal>
  )
}