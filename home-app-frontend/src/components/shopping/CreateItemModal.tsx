import { Modal, Stack, TextInput, Select, Group, Box, Image, Button, FileButton, Divider, Text, NumberInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconUpload, IconBasket } from '@tabler/icons-react'
import { getPhotoSrc } from '../../utils/photo'
import { type PhotoDTO } from '../PhotoUpload'

interface CreateItemModalProps {
  opened: boolean
  onClose: () => void
  categoryOptions: { value: string; label: string }[]
  initialName: string
  onSubmit: (values: CreateItemFormValues) => void
  isPending: boolean
}

export interface CreateItemFormValues {
  name: string
  categoryId: string
  unit: string
  pcQuantity?: number
  pcUnit?: string
  nutritionSampleSize: number
  nutritionSampleUnit: string
  photo: PhotoDTO | null
}

export function CreateItemModal({
  opened,
  onClose,
  categoryOptions,
  initialName,
  onSubmit,
  isPending,
}: CreateItemModalProps) {
  const form = useForm({
    initialValues: {
      name: '',
      categoryId: '',
      unit: 'pcs',
      pcQuantity: 1,
      pcUnit: 'kg',
      nutritionSampleSize: 100,
      nutritionSampleUnit: 'g',
      photo: null as PhotoDTO | null,
    },
    validate: {
      name: (v) => (!v ? 'Name is required' : null),
      categoryId: (v) => (!v ? 'Category is required' : null),
      unit: (v) => (!v ? 'Unit is required' : null),
      nutritionSampleSize: (v) => (v <= 0 ? 'Sample size must be positive' : null),
      pcQuantity: (v, values) => (values.unit === 'pcs' && (!v || v <= 0) ? 'Piece quantity must be positive' : null),
      pcUnit: (v, values) => (values.unit === 'pcs' && !v ? 'Piece unit is required' : null),
    },
  })

  // Common grocery units
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

  // Set initial name when it changes
  if (form.values.name === '' && initialName) {
    form.setFieldValue('name', initialName)
  }

  const handlePhotoUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => form.setFieldValue('photo', { data: e.target?.result as string })
      reader.readAsDataURL(file)
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create New Master Item"
      radius="md"
      zIndex={4000}
    >
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput required label="Item Name" {...form.getInputProps('name')} />
          <Group grow>
            <Select
              required
              label="Category"
              placeholder="Select category"
              data={categoryOptions}
              searchable
              comboboxProps={{ withinPortal: true, zIndex: 5000 }}
              {...form.getInputProps('categoryId')}
            />
            <Select
              required
              label="Default Unit"
              placeholder="Select unit"
              data={unitOptions}
              searchable
              comboboxProps={{ withinPortal: true, zIndex: 5000 }}
              {...form.getInputProps('unit')}
            />
          </Group>

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
                  comboboxProps={{ withinPortal: true, zIndex: 5000 }}
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
              comboboxProps={{ withinPortal: true, zIndex: 5000 }}
              {...form.getInputProps('nutritionSampleUnit')}
            />
          </Group>

          <Group align="flex-end">
            <Box
              w={64}
              h={64}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--mantine-color-gray-3)',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              {form.values.photo ? (
                <Image
                  src={getPhotoSrc(form.values.photo)}
                  fit="contain"
                  h={64}
                  w={64}
                />
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

          <Button type="submit" mt="md" loading={isPending}>
            Create and Select
          </Button>
        </Stack>
      </form>
    </Modal>
  )
}