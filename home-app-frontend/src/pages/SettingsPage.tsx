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
} from '@mantine/core'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAgeGroups, updateAgeGroups, fetchFamilyRoles } from '../services/api'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconDeviceFloppy, IconInfoCircle } from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import type { AgeGroupConfig } from '../services/api'

export function SettingsPage() {
  const queryClient = useQueryClient()
  const { data: roles } = useQuery({ queryKey: ['family-roles'], queryFn: fetchFamilyRoles })
  const { data: ageGroups, isLoading: loadingAgeGroups } = useQuery({ 
    queryKey: ['age-groups'], 
    queryFn: fetchAgeGroups 
  })

  const [localAgeGroups, setLocalAgeGroups] = useState<AgeGroupConfig[]>([])

  useEffect(() => {
    if (ageGroups) {
      setLocalAgeGroups(ageGroups)
    }
  }, [ageGroups])

  const mutation = useMutation({
    mutationFn: updateAgeGroups,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['age-groups'] })
      queryClient.invalidateQueries({ queryKey: ['user'] }) // Recalculate current user's group
      notifications.show({
        title: 'Settings Saved',
        message: 'Age group configurations have been updated.',
        color: 'green',
        icon: <IconCheck size={18} />,
      })
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Update Failed',
        message: error.message || 'Could not update settings.',
        color: 'red',
      })
    },
  })

  const handleAgeChange = (id: number, field: 'minAge' | 'maxAge', value: string | number) => {
    const numValue = typeof value === 'string' ? parseInt(value) : value
    setLocalAgeGroups((current) =>
      current.map((g) => (g.id === id ? { ...g, [field]: numValue } : g))
    )
  }

  const handleSave = () => {
    mutation.mutate(localAgeGroups)
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Stack gap={0}>
          <Title order={2}>Household Settings</Title>
          <Text c="dimmed">Configure family roles and automated age classification</Text>
        </Stack>

        <Paper withBorder p="xl" radius="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={4}>Age Group Ranges</Title>
              <Button 
                leftSection={<IconDeviceFloppy size={16} />} 
                onClick={handleSave}
                loading={mutation.isPending}
                disabled={loadingAgeGroups}
              >
                Save Ranges
              </Button>
            </Group>
            
            <Text size="sm" c="dimmed">
              Define the age boundaries for each group. Changes will automatically reclassify all family members.
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

        <Paper withBorder p="xl" radius="md">
          <Stack gap="md">
            <Title order={4}>Family Roles</Title>
            <Text size="sm" c="dimmed">
              Available roles for household assignment. Core roles are immutable.
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
              {roles?.map((role) => (
                <Paper key={role.id} withBorder p="sm" radius="md" bg="gray.0">
                  <Group justify="space-between">
                    <Text fw={600} size="sm">{role.name}</Text>
                    {role.immutable ? (
                      <Badge size="xs" variant="outline">System</Badge>
                    ) : (
                      <Badge size="xs" color="indigo">Custom</Badge>
                    )}
                  </Group>
                </Paper>
              ))}
            </SimpleGrid>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}
