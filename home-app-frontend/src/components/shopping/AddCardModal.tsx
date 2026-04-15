import { Modal, Stack, TextInput, Select, Button } from '@mantine/core'
import { useForm } from '@mantine/form'

interface AddCardModalProps {
  opened: boolean
  onClose: () => void
  onSubmit: (values: CardFormValues) => void
  isPending: boolean
}

export interface CardFormValues {
  name: string
  number: string
  barcodeType: 'QR' | 'CODE_128'
}

export function AddCardModal({ opened, onClose, onSubmit, isPending }: AddCardModalProps) {
  const form = useForm({
    initialValues: {
      name: '',
      number: '',
      barcodeType: 'CODE_128' as 'QR' | 'CODE_128',
    },
    validate: {
      name: (v) => (!v ? 'Name is required' : null),
      number: (v) => (!v ? 'Number is required' : null),
    },
  })

  return (
    <Modal opened={opened} onClose={onClose} title="Add Loyalty Card" radius="md" zIndex={2000}>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            required
            label="Card Name"
            placeholder="e.g. My Clubcard"
            {...form.getInputProps('name')}
          />
          <TextInput
            required
            label="Card Number"
            placeholder="Scan or type number"
            {...form.getInputProps('number')}
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
          <Button type="submit" mt="md" loading={isPending}>
            Add Card
          </Button>
        </Stack>
      </form>
    </Modal>
  )
}