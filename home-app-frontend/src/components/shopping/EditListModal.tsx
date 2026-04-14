import { Modal, Stack, TextInput, Textarea, Button } from '@mantine/core'
import { useForm } from '@mantine/form'
import type { ShoppingList } from '../../services/api'

interface EditListModalProps {
  opened: boolean
  onClose: () => void
  list: ShoppingList | null
  onSubmit: (data: { name: string; description: string }) => void
  isPending: boolean
}

export function EditListModal({ opened, onClose, list, onSubmit, isPending }: EditListModalProps) {
  const form = useForm({
    initialValues: {
      name: list?.name || '',
      description: list?.description || '',
    },
    validate: {
      name: (v) => (!v ? 'Name is required' : null),
    },
  })

  // Update form values when list changes
  if (list && (form.values.name !== list.name || form.values.description !== (list.description || ''))) {
    form.setValues({
      name: list.name,
      description: list.description || '',
    })
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Edit List Info" radius="md" zIndex={2000}>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput required label="List Name" {...form.getInputProps('name')} />
          <Textarea
            label="Description"
            placeholder="Markdown supported"
            minRows={6}
            {...form.getInputProps('description')}
          />
          <Button type="submit" mt="md" loading={isPending}>
            Save Changes
          </Button>
        </Stack>
      </form>
    </Modal>
  )
}