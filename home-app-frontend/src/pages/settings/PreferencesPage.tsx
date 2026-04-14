import {
  Title,
  Text,
  Paper,
  Stack,
  Switch,
  Group,
  Divider,
  LoadingOverlay,
  Box,
  ThemeIcon,
} from '@mantine/core'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import {
  IconSettings,
  IconShoppingCart,
  IconLayoutDashboard,
  IconTicket,
} from '@tabler/icons-react'
import { fetchUserPreferences, updateUserPreferences } from '../../services/api'

export function PreferencesPage() {
  const queryClient = useQueryClient()

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: fetchUserPreferences,
  })

  const mutation = useMutation({
    mutationFn: updateUserPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] })
      notifications.show({
        title: 'Success',
        message: 'Preferences updated successfully',
        color: 'green',
      })
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to update preferences',
        color: 'red',
      })
    },
  })

  const handleToggleShopping = (checked: boolean) => {
    mutation.mutate({
      showShoppingWidget: checked,
      showCouponsWidget: preferences?.showCouponsWidget ?? true,
    })
  }

  const handleToggleCoupons = (checked: boolean) => {
    mutation.mutate({
      showShoppingWidget: preferences?.showShoppingWidget ?? true,
      showCouponsWidget: checked,
    })
  }

  return (
    <Stack gap="lg">
      <Box pos="relative">
        <LoadingOverlay visible={isLoading || mutation.isPending} overlayProps={{ blur: 2 }} />

        <Group justify="space-between" align="flex-end" mb="md">
          <Stack gap={4}>
            <Title order={1}>Preferences</Title>
            <Text c="dimmed">Customize your experience and dashboard widgets.</Text>
          </Stack>
        </Group>

        <Paper withBorder radius="md" p="xl" shadow="sm">
          <Stack gap="xl">
            <Box>
              <Group mb="md">
                <ThemeIcon variant="light" color="indigo" size="lg">
                  <IconLayoutDashboard size={20} />
                </ThemeIcon>
                <Title order={3}>Dashboard Widgets</Title>
              </Group>
              <Text size="sm" c="dimmed" mb="lg">
                Choose which widgets you want to see on your main dashboard.
              </Text>

              <Stack gap="md">
                <Paper withBorder p="md" radius="md" bg="gray.0">
                  <Group justify="space-between">
                    <Group gap="md">
                      <ThemeIcon variant="white" color="indigo" withBorder>
                        <IconShoppingCart size={18} />
                      </ThemeIcon>
                      <div>
                        <Text fw={600} size="sm">
                          Pending Shopping Lists
                        </Text>
                        <Text size="xs" c="dimmed">
                          Shows your active shopping lists and their completion progress.
                        </Text>
                      </div>
                    </Group>
                    <Switch
                      checked={preferences?.showShoppingWidget ?? true}
                      onChange={(event) => handleToggleShopping(event.currentTarget.checked)}
                      size="md"
                      color="indigo"
                    />
                  </Group>
                </Paper>

                <Paper withBorder p="md" radius="md" bg="gray.0">
                  <Group justify="space-between">
                    <Group gap="md">
                      <ThemeIcon variant="subtle" color="teal" withBorder>
                        <IconTicket size={18} />
                      </ThemeIcon>
                      <div>
                        <Text fw={600} size="sm">
                          Pending Coupons
                        </Text>
                        <Text size="xs" c="dimmed">
                          Shows coupons that are close to expiring and haven't been used yet.
                        </Text>
                      </div>
                    </Group>
                    <Switch
                      checked={preferences?.showCouponsWidget ?? true}
                      onChange={(event) => handleToggleCoupons(event.currentTarget.checked)}
                      size="md"
                      color="teal"
                    />
                  </Group>
                </Paper>

                <Paper withBorder p="md" radius="md" bg="gray.0" style={{ opacity: 0.6 }}>
                  <Group justify="space-between">
                    <Group gap="md">
                      <ThemeIcon variant="white" color="gray" withBorder>
                        <IconSettings size={18} />
                      </ThemeIcon>
                      <div>
                        <Text fw={600} size="sm">
                          Household Tasks (Coming Soon)
                        </Text>
                        <Text size="xs" c="dimmed">
                          A widget to track shared chores and responsibilities.
                        </Text>
                      </div>
                    </Group>
                    <Switch disabled size="md" />
                  </Group>
                </Paper>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Title order={3} mb="md">
                General Settings
              </Title>
              <Text size="sm" c="dimmed">
                More preferences like language, currency, and notification settings will be
                available here in the future.
              </Text>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Stack>
  )
}
