import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Badge,
  ActionIcon,
  ThemeIcon,
  rem,
  Loader,
  Button,
  Box,
  Modal,
  Center,
  Avatar,
  Tooltip,
} from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  IconShoppingCart,
  IconChevronRight,
  IconArrowRight,
  IconBasket,
  IconTicket,
  IconCalendarClock,
  IconBuildingStore,
  IconMaximize,
} from '@tabler/icons-react'
import { QRCodeSVG } from 'qrcode.react'
import Barcode from 'react-barcode'
import { useAuth } from '../../context/AuthContext'
import { fetchLists, fetchUserPreferences, fetchExpiringCoupons, fetchMealPlan } from '../../services/api'
import type { Coupon } from '../../services/api'
import dayjs from 'dayjs'
import { getPhotoSrc } from '../../utils/photo'

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

  const { data: mealPlan, isLoading: mealPlanLoading } = useQuery({
    queryKey: ['meal-plan-today'],
    queryFn: () => fetchMealPlan(dayjs().format('YYYY-MM-DD')),
  })

  const [fullscreenCoupon, setFullscreenCoupon] = useState<Coupon | null>(null)

  const pendingLists = lists?.filter((l) => l.status === 'PENDING') || []
  const expiringCoupons = coupons || []
  
  const getDayValue = (val: any): number => {
    if (typeof val === 'number') return val;
    const dayMap: Record<string, number> = {
      'MONDAY': 0, 'TUESDAY': 1, 'WEDNESDAY': 2, 'THURSDAY': 3,
      'FRIDAY': 4, 'SATURDAY': 5, 'SUNDAY': 6
    };
    return dayMap[String(val).toUpperCase()] ?? 0;
  };

  const todayNum = (dayjs().day() + 6) % 7; // Convert 0(Sun)-6(Sat) to 0(Mon)-6(Sun)
  const todayMeals = mealPlan?.entries.filter(e => getDayValue(e.dayOfWeek) === todayNum) || [];

  const showShopping = preferences?.showShoppingWidget ?? true
  const showCoupons = preferences?.showCouponsWidget ?? true

  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Title order={1}>Welcome back, {user?.firstName}!</Title>
        <Text c="dimmed">Here is what's happening in your household today.</Text>
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
                  <Text size="sm" c="dimmed">
                    No pending shopping lists
                  </Text>
                  <Button variant="light" size="xs" component={Link} to="/shopping/lists">
                    Create one
                  </Button>
                </Stack>
              )}

              {!listsLoading && pendingLists.length > 0 && (
                <Stack gap="sm">
                  {pendingLists.map((list) => {
                    const bought = list.items.filter((i) => i.bought && !i.unavailable).length
                    const total = list.items.filter((i) => !i.unavailable).length
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
                          transition: 'background-color 100ms ease',
                        }}
                      >
                        <Group justify="space-between" wrap="nowrap">
                          <Group gap="sm" wrap="nowrap">
                            <ThemeIcon variant="light" color="indigo" radius="sm">
                              <IconShoppingCart size={16} />
                            </ThemeIcon>
                            <Box style={{ overflow: 'hidden' }}>
                              <Text fw={600} size="sm" truncate>
                                {list.name}
                              </Text>
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

        <Stack style={{ minWidth: rem(350), flex: 1 }}>
          <Group justify="space-between" align="center">
            <Title order={3}>Today's Meals</Title>
            <Button
              variant="subtle"
              size="compact-sm"
              component={Link}
              to="/recipes/planner"
              rightSection={<IconArrowRight size={14} />}
            >
              Full Planner
            </Button>
          </Group>

          <Paper withBorder radius="md" p="md">
            {mealPlanLoading ? (
              <Group justify="center" py="xl"><Loader size="sm" /></Group>
            ) : todayMeals.length === 0 ? (
              <Stack align="center" py="xl" gap="xs">
                <ThemeIcon variant="light" size="xl" radius="md" color="gray">
                  <IconCalendarClock size={24} />
                </ThemeIcon>
                <Text size="sm" c="dimmed">No meals planned for today</Text>
              </Stack>
            ) : (
              <Stack gap="sm">
                {todayMeals.map(meal => (
                  <Paper key={meal.id} withBorder p="sm" radius="sm">
                    <Group justify="space-between">
                      <Box>
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">{meal.mealTimeName}</Text>
                        <Stack gap={2} mt={4}>
                          {meal.recipes.map((r, i) => (
                            <Box key={i}>
                              <Text size="sm" fw={500}>
                                {r.recipe.name}
                              </Text>
                              {r.users.length > 0 && (
                                <Group gap={4} mt={2}>
                                  <Avatar.Group spacing="xs">
                                    {r.users.map(user => (
                                      <Tooltip key={user.id} label={user.name} withArrow>
                                        <Avatar 
                                          src={getPhotoSrc(user.photo as any)} 
                                          size={30} 
                                          radius="xl"
                                          alt={user.name}
                                          variant="light"
                                          color="blue"
                                        >
                                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                        </Avatar>
                                      </Tooltip>
                                    ))}
                                  </Avatar.Group>
                                </Group>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                      {meal.isDone && <Badge color="green" variant="light" size="xs">DONE</Badge>}
                    </Group>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Stack>

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
                  <Text size="sm" c="dimmed">
                    No expiring coupons
                  </Text>
                </Stack>
              )}

              {!couponsLoading && expiringCoupons.length > 0 && (
                <Stack gap="sm">
                  {expiringCoupons.map((coupon) => {
                    const isExpired =
                      coupon.dueDate &&
                      new Date(coupon.dueDate) < new Date(new Date().setHours(0, 0, 0, 0))
                    return (
                      <Paper
                        key={coupon.id}
                        withBorder
                        p="sm"
                        radius="sm"
                        style={{
                          transition: 'background-color 100ms ease',
                          opacity: isExpired ? 0.7 : 1,
                          backgroundColor: isExpired ? 'var(--mantine-color-red-0)' : undefined,
                        }}
                      >
                        <Group justify="space-between" wrap="nowrap">
                          <Group gap="sm" wrap="nowrap">
                            <ThemeIcon
                              variant="light"
                              color={isExpired ? 'red' : 'teal'}
                              radius="sm"
                            >
                              <IconTicket size={16} />
                            </ThemeIcon>
                            <Box style={{ overflow: 'hidden' }}>
                              <Text fw={600} size="sm" truncate>
                                {coupon.name}
                              </Text>
                              <Group gap={4} wrap="nowrap">
                                <IconBuildingStore size={12} color="var(--mantine-color-dimmed)" />
                                <Text size="xs" c="dimmed" truncate>
                                  {coupon.store.name}
                                </Text>
                              </Group>
                            </Box>
                          </Group>
                          <Group gap="xs" wrap="nowrap">
                            {coupon.barcode?.code && (
                              <ActionIcon
                                variant="subtle"
                                color="blue"
                                size="sm"
                                onClick={() => setFullscreenCoupon(coupon)}
                              >
                                <IconMaximize size={14} />
                              </ActionIcon>
                            )}
                            <Badge
                              color="red"
                              variant={isExpired ? 'filled' : 'light'}
                              size="sm"
                              leftSection={<IconCalendarClock size={12} />}
                            >
                              {isExpired
                                ? 'EXPIRED'
                                : coupon.dueDate
                                  ? new Date(coupon.dueDate).toLocaleDateString()
                                  : 'No date'}
                            </Badge>
                          </Group>
                        </Group>
                      </Paper>
                    )
                  })}
                </Stack>
              )}
            </Paper>
          </Stack>
        )}
      </Group>

      {/* Fullscreen Coupon Code View */}
      <Modal
        opened={!!fullscreenCoupon}
        onClose={() => setFullscreenCoupon(null)}
        title={fullscreenCoupon?.name}
        fullScreen
        zIndex={3000}
      >
        <Center h="100%" pb={rem(100)}>
          <Stack align="center" gap="xl" w="100%">
            {fullscreenCoupon?.barcode?.code && (
              <Box
                bg="white"
                p="xl"
                style={{ borderRadius: rem(12), boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}
              >
                {fullscreenCoupon.barcode.type === 'QR' ? (
                  <QRCodeSVG value={fullscreenCoupon.barcode.code} size={280} />
                ) : (
                  <Box style={{ transform: 'scale(1.5)', transformOrigin: 'center' }} py="xl">
                    <Barcode
                      value={fullscreenCoupon.barcode.code}
                      width={2}
                      height={100}
                      fontSize={16}
                    />
                  </Box>
                )}
              </Box>
            )}
            <Text size="xl" fw={700} ff="monospace" style={{ letterSpacing: rem(2) }}>
              {fullscreenCoupon?.barcode?.code}
            </Text>
            <Button size="lg" variant="light" onClick={() => setFullscreenCoupon(null)}>
              Close
            </Button>
          </Stack>
        </Center>
      </Modal>
    </Stack>
  )
}
