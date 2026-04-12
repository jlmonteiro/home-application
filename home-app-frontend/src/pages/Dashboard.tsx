import { Title, Text, Paper, Stack, Group, Badge, ActionIcon, List, ThemeIcon, rem, Loader, Button, Box } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  IconShoppingCart, 
  IconChevronRight, 
  IconArrowRight, 
  IconBasket, 
  IconTicket,
  IconCalendarClock,
  IconBuildingStore
} from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext'
import { fetchLists, fetchUserPreferences, fetchExpiringCoupons } from '../services/api'

export function Dashboard() {
  const { user } = useAuth()

  const { data: preferences } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: fetchUserPreferences,
  })

  const { data: lists, isLoading: listsLoading } = useQuery({
    queryKey: ['shopping-lists'],
    queryFn: fetchLists,
    enabled: preferences?.showShoppingWidget ?? true,
  })

  const { data: coupons, isLoading: couponsLoading } = useQuery({
    queryKey: ['expiring-coupons'],
    queryFn: fetchExpiringCoupons,
    enabled: preferences?.showCouponsWidget ?? true,
  })

  const pendingLists = lists?.filter(l => l.status === 'PENDING') || []
  const expiringCoupons = coupons || []

  const showShopping = preferences?.showShoppingWidget ?? true
  const showCoupons = preferences?.showCouponsWidget ?? true

  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Title order={1}>Welcome back, {user?.firstName}!</Title>
        <Text c="dimmed">
          Here is what's happening in your household today.
        </Text>
      </Stack>

      <Group grow align="flex-start" wrap="wrap">
        {showShopping && (
          <Stack style={{ minWidth: rem(350), flex: 1 }}>
            <Group justify="space-between" align="center">
              <Title order={3}>Pending Shopping Lists</Title>
              <Button 
                variant="subtle" 
                size="compact-sm" 
                component={Link} 
                to="/shopping/lists"
                rightSection={<IconArrowRight size={14} />}
              >
                View all
              </Button>
            </Group>

            <Paper withBorder radius="md" p="md" pos="relative">
              {listsLoading && (
                <Group justify="center" py="xl">
                  <Loader size="sm" />
                </Group>
              )}

              {!listsLoading && pendingLists.length === 0 && (
                <Stack align="center" py="xl" gap="xs">
                  <ThemeIcon variant="light" size="xl" radius="md" color="gray">
                    <IconBasket size={24} />
                  </ThemeIcon>
                  <Text size="sm" c="dimmed">No pending shopping lists</Text>
                  <Button variant="light" size="xs" component={Link} to="/shopping/lists">Create one</Button>
                </Stack>
              )}

              {!listsLoading && pendingLists.length > 0 && (
                <Stack gap="sm">
                  {pendingLists.map((list) => {
                    const bought = list.items.filter(i => i.bought && !i.unavailable).length
                    const total = list.items.filter(i => !i.unavailable).length
                    const progress = total > 0 ? Math.round((bought / total) * 100) : 0

                    return (
                      <Paper 
                        key={list.id} 
                        withBorder 
                        p="sm" 
                        radius="sm" 
                        component={Link} 
                        to={`/shopping/lists/${list.id}`}
                        style={{ 
                          textDecoration: 'none', 
                          color: 'inherit',
                          transition: 'background-color 100ms ease'
                        }}
                      >
                        <Group justify="space-between" wrap="nowrap">
                          <Group gap="sm" wrap="nowrap">
                            <ThemeIcon variant="light" color="indigo" radius="sm">
                              <IconShoppingCart size={16} />
                            </ThemeIcon>
                            <Box style={{ overflow: 'hidden' }}>
                              <Text fw={600} size="sm" truncate>{list.name}</Text>
                              <Text size="xs" c="dimmed">
                                {bought}/{total} items • {progress}% complete
                              </Text>
                            </Box>
                          </Group>
                          <IconChevronRight size={16} color="var(--mantine-color-gray-4)" />
                        </Group>
                      </Paper>
                    )
                  })}
                </Stack>
              )}
            </Paper>
          </Stack>
        )}

        {showCoupons && (
          <Stack style={{ minWidth: rem(350), flex: 1 }}>
            <Group justify="space-between" align="center">
              <Title order={3}>Expiring Coupons</Title>
              <Button 
                variant="subtle" 
                size="compact-sm" 
                component={Link} 
                to="/shopping/stores"
                rightSection={<IconArrowRight size={14} />}
              >
                View stores
              </Button>
            </Group>

            <Paper withBorder radius="md" p="md" pos="relative">
              {couponsLoading && (
                <Group justify="center" py="xl">
                  <Loader size="sm" />
                </Group>
              )}

              {!couponsLoading && expiringCoupons.length === 0 && (
                <Stack align="center" py="xl" gap="xs">
                  <ThemeIcon variant="light" size="xl" radius="md" color="gray">
                    <IconTicket size={24} />
                  </ThemeIcon>
                  <Text size="sm" c="dimmed">No expiring coupons</Text>
                </Stack>
              )}

              {!couponsLoading && expiringCoupons.length > 0 && (
                <Stack gap="sm">
                  {expiringCoupons.map((coupon) => (
                    <Paper 
                      key={coupon.id} 
                      withBorder 
                      p="sm" 
                      radius="sm"
                      style={{ transition: 'background-color 100ms ease' }}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap="sm" wrap="nowrap">
                          <ThemeIcon variant="light" color="teal" radius="sm">
                            <IconTicket size={16} />
                          </ThemeIcon>
                          <Box style={{ overflow: 'hidden' }}>
                            <Text fw={600} size="sm" truncate>{coupon.name}</Text>
                            <Group gap={4} wrap="nowrap">
                              <IconBuildingStore size={12} color="var(--mantine-color-dimmed)" />
                              <Text size="xs" c="dimmed" truncate>{coupon.storeName}</Text>
                            </Group>
                          </Box>
                        </Group>
                        <Badge color="red" variant="light" size="sm" leftSection={<IconCalendarClock size={12} />}>
                          {coupon.dueDate ? new Date(coupon.dueDate).toLocaleDateString() : 'No date'}
                        </Badge>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Paper>
          </Stack>
        )}

        <Stack style={{ minWidth: rem(350), flex: 1 }}>
          <Title order={3}>Quick Actions</Title>
          <Paper withBorder p="md" radius="md">
            <Text size="sm" c="dimmed">
              More dashboard widgets coming soon, including family member activities and household tasks.
            </Text>
            {(!showShopping || !showCoupons) && (
              <Text size="xs" mt="sm" c="indigo" component={Link} to="/preferences" style={{ textDecoration: 'none' }}>
                Enable widgets in your preferences →
              </Text>
            )}
          </Paper>
        </Stack>
      </Group>
    </Stack>
  )
}
