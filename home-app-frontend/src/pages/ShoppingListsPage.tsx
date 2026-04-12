import {
  Title,
  Text,
  Button,
  Group,
  Stack,
  ActionIcon,
  Modal,
  TextInput,
  Textarea,
  rem,
  LoadingOverlay,
  Box,
  Badge,
  Paper,
  SimpleGrid,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { Link } from 'react-router-dom'
import { 
  IconPlus, 
  IconTrash, 
  IconBasket, 
  IconChevronRight, 
  IconCalendar,
  IconUser
} from '@tabler/icons-react'
import { fetchLists, createList, deleteList } from '../services/api'
import type { ShoppingList } from '../services/api'
import { MarkdownContent } from '../components/MarkdownContent'

export function ShoppingListsPage() {
  const queryClient = useQueryClient()
  const [opened, { open, close }] = useDisclosure(false)

  const { data: lists, isLoading } = useQuery({
    queryKey: ['shopping-lists'],
    queryFn: fetchLists,
  })

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must have at least 2 characters' : null),
    },
  })

  const createMutation = useMutation({
    mutationFn: (values: any) => createList({
      name: values.name,
      description: values.description,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] })
      notifications.show({ title: 'Success', message: 'Shopping list created', color: 'green' })
      close()
      form.reset()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] })
      notifications.show({ title: 'Success', message: 'List deleted', color: 'green' })
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'green'
      case 'PENDING': return 'blue'
      default: return 'gray'
    }
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>Shopping Lists</Title>
          <Text c="dimmed" size="sm">Plan your shopping and track items</Text>
        </div>
        <Button leftSection={<IconPlus size={18} />} onClick={open}>
          New List
        </Button>
      </Group>

      {isLoading ? <LoadingOverlay visible /> : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {lists?.map((list: ShoppingList) => (
            <Paper key={list.id} withBorder p="md" radius="md" shadow="sm" pos="relative">
              <Stack gap="xs">
                <Group justify="space-between" wrap="nowrap">
                  <Text fw={700} size="lg" lineClamp={1}>{list.name}</Text>
                  <Badge color={getStatusColor(list.status)} variant="light">
                    {list.status}
                  </Badge>
                </Group>

                {list.description && (
                  <Box style={{ maxHeight: rem(80), overflow: 'hidden', position: 'relative' }}>
                    <MarkdownContent content={list.description} />
                    <Box 
                      style={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        left: 0, 
                        right: 0, 
                        height: rem(20), 
                        background: 'linear-gradient(transparent, var(--mantine-color-body))' 
                      }} 
                    />
                  </Box>
                )}

                <Group gap="xs" wrap="nowrap">
                  <IconUser size={14} color="gray" />
                  <Text size="xs" c="dimmed">By {list.creatorName}</Text>
                </Group>

                <Group gap="xs" wrap="nowrap">
                  <IconCalendar size={14} color="gray" />
                  <Text size="xs" c="dimmed">
                    {new Date(list.createdAt).toLocaleDateString()}
                  </Text>
                </Group>

                <Group justify="space-between" mt="md">
                  <ActionIcon variant="subtle" color="red" onClick={() => {
                    if (window.confirm('Delete this list?')) deleteMutation.mutate(list.id)
                  }}>
                    <IconTrash size={16} />
                  </ActionIcon>
                  <Button 
                    variant="light" 
                    rightSection={<IconChevronRight size={16} />}
                    component={Link}
                    to={`/shopping/lists/${list.id}`}
                  >
                    View Items
                  </Button>
                </Group>
              </Stack>
            </Paper>
          ))}
          {lists?.length === 0 && (
            <Paper withBorder p="xl" radius="md" style={{ gridColumn: '1 / -1' }}>
              <Stack align="center" gap="xs">
                <IconBasket size={48} stroke={1} color="gray" />
                <Text ta="center" c="dimmed">No shopping lists found. Create your first list to get started!</Text>
              </Stack>
            </Paper>
          )}
        </SimpleGrid>
      )}

      <Modal opened={opened} onClose={close} title="Create New Shopping List" radius="md" zIndex={2000}>
        <form onSubmit={form.onSubmit((v) => createMutation.mutate(v))}>
          <Stack gap="md">
            <TextInput required label="List Name" placeholder="e.g. Weekly Groceries" {...form.getInputProps('name')} />
            <Textarea 
              label="Description" 
              placeholder="Optional notes about this list (Markdown supported)" 
              minRows={4}
              {...form.getInputProps('description')} 
            />
            <Button type="submit" mt="md" loading={createMutation.isPending}>Create List</Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  )
}
