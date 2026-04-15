import {
  Container,
  Stack,
  Title,
  Text,
  Paper,
  SimpleGrid,
  NumberInput,
  Button,
  Group,
  Table,
  Badge,
  ActionIcon,
  TextInput,
  Modal,
  Box,
  useComputedColorScheme,
} from '@mantine/core'
import { modals } from '@mantine/modals'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAgeGroups,
  updateAgeGroups,
  fetchFamilyRoles,
  createFamilyRole,
  updateFamilyRole,
  deleteFamilyRole,
  type ApiError,
} from '../../services/api'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconDeviceFloppy, IconPlus, IconTrash, IconPencil } from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import { useDisclosure } from '@mantine/hooks'
import type { AgeGroupConfig, FamilyRole } from '../../services/api'

export function SettingsPage() {
  const queryClient = useQueryClient()
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const [modalOpened, { open, close }] = useDisclosure(false)
  const [editingRole, setEditingRole] = useState<FamilyRole | null>(null)
  const [newRoleName, setNewRoleName] = useState('')

  // -- Queries --
  const { data: roles } = useQuery({ queryKey: ['family-roles'], queryFn: fetchFamilyRoles })
  const { data: ageGroups, isLoading: loadingAgeGroups } = useQuery({
    queryKey: ['age-groups'],
    queryFn: fetchAgeGroups,
  })

  const [localAgeGroups, setLocalAgeGroups] = useState<AgeGroupConfig[]>([])

  useEffect(() => {
    if (ageGroups && localAgeGroups.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Populating local state from fetched data for editing
      setLocalAgeGroups(ageGroups)
    }
  }, [ageGroups, localAgeGroups.length])

  // -- Mutations --
  const ageMutation = useMutation({
    mutationFn: updateAgeGroups,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['age-groups'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      notifications.show({
        title: 'Settings Saved',
        message: 'Age group configurations have been updated.',
        color: 'green',
        icon: <IconCheck size={18} />,
      })
    },
    onError: (error: ApiError) => {
      notifications.show({
        title: 'Update Failed',
        message: error.message || 'Could not update settings.',
        color: 'red',
      })
    },
  })

  const createRoleMutation = useMutation({
    mutationFn: createFamilyRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-roles'] })
      notifications.show({
        title: 'Role Created',
        message: 'New family role added.',
        color: 'green',
      })
      handleCloseModal()
    },
    onError: (error: ApiError) => {
      notifications.show({ title: 'Error', message: error.message, color: 'red' })
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: (data: { id: number; role: Partial<FamilyRole> }) =>
      updateFamilyRole(data.id, data.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-roles'] })
      notifications.show({
        title: 'Role Updated',
        message: 'Family role has been renamed.',
        color: 'green',
      })
      handleCloseModal()
    },
    onError: (error: ApiError) => {
      notifications.show({ title: 'Error', message: error.message, color: 'red' })
    },
  })

  const deleteRoleMutation = useMutation({
    mutationFn: deleteFamilyRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-roles'] })
      notifications.show({ title: 'Role Deleted', message: 'Family role removed.', color: 'green' })
    },
    onError: (error: ApiError) => {
      notifications.show({
        title: 'Delete Failed',
        message: error.message || 'Check if any user is still assigned to this role.',
        color: 'red',
      })
    },
  })

  // -- Handlers --
  const handleAgeChange = (id: number, field: 'minAge' | 'maxAge', value: string | number) => {
    const numValue = typeof value === 'string' ? parseInt(value) : value
    setLocalAgeGroups((current) =>
      current.map((g) => (g.id === id ? { ...g, [field]: numValue } : g)),
    )
  }

  const handleSaveAgeGroups = () => {
    ageMutation.mutate(localAgeGroups)
  }

  const handleEditRole = (role: FamilyRole) => {
    setEditingRole(role)
    setNewRoleName(role.name)
    open()
  }

  const handleCloseModal = () => {
    setEditingRole(null)
    setNewRoleName('')
    close()
  }

  const handleSaveRole = () => {
    if (editingRole) {
      updateRoleMutation.mutate({ id: editingRole.id, role: { name: newRoleName } })
    } else {
      createRoleMutation.mutate({ name: newRoleName })
    }
  }

  const openDeleteConfirmModal = (role: FamilyRole) =>
    modals.openConfirmModal({
      title: 'Delete Family Role?',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete the <b>{role.name}</b> role? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete role', cancel: 'No, keep it' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteRoleMutation.mutate(role.id),
    })

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Stack gap={0}>
          <Title order={2}>Household Settings</Title>
          <Text c="dimmed">Configure family roles and automated age classification</Text>
        </Stack>

        {/* Age Groups Section */}
        <Paper withBorder p="xl" radius="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={4}>Age Group Ranges</Title>
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={handleSaveAgeGroups}
                loading={ageMutation.isPending}
                disabled={loadingAgeGroups}
              >
                Save Ranges
              </Button>
            </Group>

            <Text size="sm" c="dimmed">
              Define the age boundaries for each group. Changes will automatically reclassify all
              family members.
            </Text>

            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Group Name</Table.Th>
                  <Table.Th>Min Age</Table.Th>
                  <Table.Th>Max Age</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {localAgeGroups.map((group) => (
                  <Table.Tr key={group.id}>
                    <Table.Td fw={500}>{group.name}</Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={group.minAge}
                        onChange={(val) => handleAgeChange(group.id, 'minAge', val)}
                        min={0}
                        max={120}
                        size="xs"
                        w={80}
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={group.maxAge}
                        onChange={(val) => handleAgeChange(group.id, 'maxAge', val)}
                        min={0}
                        max={120}
                        size="xs"
                        w={80}
                      />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Paper>

        {/* Family Roles Section */}
        <Paper withBorder p="xl" radius="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={4}>Family Roles</Title>
              <Button
                variant="light"
                leftSection={<IconPlus size={16} />}
                onClick={() => {
                  setEditingRole(null)
                  open()
                }}
              >
                Add Custom Role
              </Button>
            </Group>
            <Text size="sm" c="dimmed">
              Available roles for household assignment. System roles cannot be renamed or deleted.
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {roles?.map((role) => (
                <Paper
                  key={role.id}
                  withBorder
                  p="md"
                  radius="md"
                  bg={computedColorScheme === 'dark' ? 'dark.6' : 'gray.0'}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Box>
                      <Text fw={600} size="sm">
                        {role.name}
                      </Text>
                      <Badge size="xs" variant="dot" color={role.immutable ? 'gray' : 'indigo'}>
                        {role.immutable ? 'System' : 'Custom'}
                      </Badge>
                    </Box>

                    {!role.immutable && (
                      <Group gap={4}>
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleEditRole(role)}
                        >
                          <IconPencil size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          loading={deleteRoleMutation.isPending}
                          onClick={() => openDeleteConfirmModal(role)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    )}
                  </Group>
                </Paper>
              ))}
            </SimpleGrid>
          </Stack>
        </Paper>
      </Stack>

      {/* Role Add/Edit Modal */}
      <Modal
        opened={modalOpened}
        onClose={handleCloseModal}
        title={editingRole ? 'Edit Family Role' : 'Add Custom Role'}
        centered
      >
        <Stack gap="md">
          <TextInput
            label="Role Name"
            placeholder="e.g. Grandmother, Nanny"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.currentTarget.value)}
            data-autofocus
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveRole}
              disabled={!newRoleName.trim()}
              loading={createRoleMutation.isPending || updateRoleMutation.isPending}
            >
              Save Role
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
}
