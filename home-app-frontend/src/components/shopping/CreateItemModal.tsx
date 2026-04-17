import { Modal, Stack, TextInput, Select, Group, Box, Image, Button, FileButton } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconUpload, IconBasket } from '@tabler/icons-react'
import { getPhotoSrc } from '../../utils/photo'

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
  photo: string
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
      photo: '',
    },
    validate: {
      name: (v) => (!v ? 'Name is required' : null),
      categoryId: (v) => (!v ? 'Category is required' : null),
    },
  })

  // Set initial name when it changes
  if (form.values.name === '' && initialName) {
    form.setFieldValue('name', initialName)
  }

  const handlePhotoUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => form.setFieldValue('photo', e.target?.result as string)
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
          <Select
            required
            label="Category"
            placeholder="Select category"
            data={categoryOptions}
            searchable
            comboboxProps={{ withinPortal: true, zIndex: 5000 }}
            {...form.getInputProps('categoryId')}
          />

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