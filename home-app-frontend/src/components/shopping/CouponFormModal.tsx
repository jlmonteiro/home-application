import { useEffect } from 'react'
import { Modal, Stack, TextInput, Textarea, Select, Divider, Button, Text } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { IconBarcode } from '@tabler/icons-react'
import { formatEuro } from '../../utils/currency'
import type { Coupon } from '../../services/api'

interface CouponFormModalProps {
  opened: boolean
  onClose: () => void
  editingCoupon: Coupon | null
  onSubmit: (values: CouponFormValues) => void
  isPending: boolean
}

export interface CouponFormValues {
  name: string
  description: string
  value: string
  dueDate: Date | null
  code: string
  barcodeType: 'QR' | 'CODE_128'
}

export function CouponFormModal({
  opened,
  onClose,
  editingCoupon,
  onSubmit,
  isPending,
}: CouponFormModalProps) {
  const form = useForm<CouponFormValues>({
    initialValues: {
      name: '',
      description: '',
      value: '',
      dueDate: null,
      code: '',
      barcodeType: 'CODE_128',
    },
    validate: {
      name: (v) => (!v ? 'Name is required' : null),
    },
  })

  // Initialize form when editingCoupon changes
  useEffect(() => {
    if (editingCoupon) {
      form.setValues({
        name: editingCoupon.name,
        description: editingCoupon.description || '',
        value: editingCoupon.value?.replace('€', '') || '',
        dueDate: editingCoupon.dueDate ? new Date(editingCoupon.dueDate) : null,
        code: editingCoupon.barcode?.code || '',
        barcodeType: (editingCoupon.barcode?.type as 'QR' | 'CODE_128') || 'CODE_128',
      })
    } else {
      form.reset()
    }
  }, [editingCoupon?.id])

  const handleSubmit = () => {
    const values = form.values
    // Format value to Euro before submitting
    const formattedValues: CouponFormValues = {
      ...values,
      value: formatEuro(values.value),
    }
    onSubmit(formattedValues)
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editingCoupon ? 'Edit Coupon' : 'Add Coupon'}
      radius="md"
      zIndex={2000}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            required
            label="Coupon Name"
            placeholder="e.g. €5 off €25"
            {...form.getInputProps('name')}
          />
          <TextInput
            label="Value"
            placeholder="5.00"
            leftSection={<Text size="sm">€</Text>}
            {...form.getInputProps('value')}
          />
          <Textarea
            label="Description"
            placeholder="Optional details"
            {...form.getInputProps('description')}
          />
          <DateInput
            label="Due Date"
            placeholder="When does this coupon expire?"
            clearable
            {...form.getInputProps('dueDate')}
          />

          <Divider label="Code Details" labelPosition="center" />

          <TextInput
            label="Coupon Code"
            placeholder="Code to scan at checkout"
            leftSection={<IconBarcode size={16} />}
            {...form.getInputProps('code')}
          />
          <Select
            label="Barcode Type"
            data={[
              { value: 'CODE_128', label: 'Standard Barcode (CODE128)' },
              { value: 'QR', label: 'QR Code' },
            ]}
            comboboxProps={{ withinPortal: true, zIndex: 3000 }}
            {...form.getInputProps('barcodeType')}
          />

          <Button
            type="submit"
            mt="md"
            loading={isPending}
          >
            {editingCoupon ? 'Save Changes' : 'Add Coupon'}
          </Button>
        </Stack>
      </form>
    </Modal>
  )
}