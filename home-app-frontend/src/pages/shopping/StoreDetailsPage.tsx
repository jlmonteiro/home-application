import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Title,
  Text,
  Button,
  Group,
  Stack,
  ActionIcon,
  rem,
  LoadingOverlay,
  Box,
  Badge,
  Paper,
  SimpleGrid,
  Image,
  Tabs,
  Center,
  Divider,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  IconArrowLeft,
  IconPlus,
  IconTrash,
  IconCreditCard,
  IconTicket,
  IconCalendar,
  IconCheck,
  IconClock,
  IconBuildingStore,
  IconMaximize,
  IconEdit,
} from '@tabler/icons-react'
import {
  fetchStore,
  fetchLoyaltyCards,
  createLoyaltyCard,
  deleteLoyaltyCard,
  fetchCoupons,
  createCoupon,
  deleteCoupon,
  updateCoupon,
  type ApiError,
} from '../../services/api'
import type { Coupon } from '../../services/api'
import { useState } from 'react'
import dayjs from 'dayjs'
import { getPhotoSrc } from '../../utils/photo'
import { formatEuro } from '../../utils/currency'
import { AddCardModal, type CardFormValues } from '../../components/shopping/AddCardModal'
import { CouponFormModal, type CouponFormValues } from '../../components/shopping/CouponFormModal'
import { BarcodeDisplay } from '../../components/shopping/BarcodeDisplay'
import { FullscreenBarcodeModal } from '../../components/shopping/FullscreenBarcodeModal'

export function StoreDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const storeId = parseInt(id || '0')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [cardOpened, { open: openCard, close: closeCard }] = useDisclosure(false)
  const [couponOpened, { open: openCoupon, close: closeCoupon }] = useDisclosure(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [fullscreenData, setFullscreenData] = useState<{
    name: string
    number: string
    barcodeType: string
  } | null>(null)

  // Queries
  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['store', storeId],
    queryFn: () => fetchStore(storeId),
  })

  const { data: loyaltyCards } = useQuery({
    queryKey: ['loyalty-cards', storeId],
    queryFn: () => fetchLoyaltyCards(storeId),
  })

  const { data: couponsData } = useQuery({
    queryKey: ['coupons', storeId],
    queryFn: () => fetchCoupons(storeId),
  })

  // Mutations
  const addCardMutation = useMutation({
    mutationFn: (values: CardFormValues) =>
      createLoyaltyCard(storeId, {
        name: values.name,
        barcode: { code: values.number, type: values.barcodeType },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-cards', storeId] })
      notifications.show({ title: 'Success', message: 'Loyalty card added', color: 'green' })
      closeCard()
    },
    onError: (error: ApiError) => {
      notifications.show({
        title: 'Error',
        message: error.data?.detail || 'Failed to add loyalty card',
        color: 'red',
      })
    },
  })

  const deleteCardMutation = useMutation({
    mutationFn: deleteLoyaltyCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-cards', storeId] })
      notifications.show({ title: 'Success', message: 'Card removed', color: 'green' })
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Failed to remove card', color: 'red' })
    },
  })
  const addCouponMutation = useMutation({
    mutationFn: (coupon: Partial<Coupon>) => createCoupon(storeId, coupon),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', storeId] })
      notifications.show({ title: 'Success', message: 'Coupon added', color: 'green' })
      closeCoupon()
    },
    onError: (error: ApiError) => {
      notifications.show({
        title: 'Error',
        message: error.data?.detail || 'Failed to add coupon',
        color: 'red',
      })
    },
  })

  const updateCouponMutation = useMutation({
    mutationFn: ({ id, coupon }: { id: number; coupon: Partial<Coupon> }) =>
      updateCoupon(id, coupon),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', storeId] })
      notifications.show({ title: 'Success', message: 'Coupon updated', color: 'green' })
      closeCoupon()
      setEditingCoupon(null)
    },
    onError: (error: ApiError) => {
      notifications.show({
        title: 'Error',
        message: error.data?.detail || 'Failed to update coupon',
        color: 'red',
      })
    },
  })

  const toggleCouponMutation = useMutation({
    mutationFn: ({ id, used }: { id: number; used: boolean }) => updateCoupon(id, { used }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', storeId] })
    },
  })

  const removeCouponMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', storeId] })
      notifications.show({ title: 'Success', message: 'Coupon removed', color: 'green' })
    },
  })

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    openCoupon()
  }

  const handleCouponSubmit = (values: CouponFormValues) => {
    const payload: Partial<Coupon> = {
      name: values.name,
      description: values.description || undefined,
      value: values.value || undefined,
      dueDate: values.dueDate ? dayjs(values.dueDate).format('YYYY-MM-DD') : undefined,
      barcode: values.code ? { code: values.code, type: values.barcodeType } : undefined,
    }

    if (editingCoupon) {
      updateCouponMutation.mutate({ id: editingCoupon.id, coupon: payload })
    } else {
      addCouponMutation.mutate(payload)
    }
  }

  if (storeLoading) return <LoadingOverlay visible />
  if (!store) return <Text>Store not found</Text>

  const coupons = couponsData?._embedded?.coupons || []

  return (
    <Stack gap="lg">
      <Group>
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate('/shopping/stores')}
        >
          Back to Stores
        </Button>
      </Group>

      <Paper p="xl" radius="md" withBorder shadow="sm">
        <Group align="flex-start" wrap="nowrap">
          <Box
            w={80}
            h={80}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {store.photo ? (
              <Image src={getPhotoSrc(store.photo)} fit="contain" />
            ) : (
              <IconBuildingStore size={48} color="gray" />
            )}
          </Box>
          <Stack gap={4}>
            <Title order={1}>{store.name}</Title>
            <Text c="dimmed">{store.description || 'No description provided.'}</Text>
          </Stack>
        </Group>
      </Paper>

      <Tabs defaultValue="cards" variant="outline" radius="md">
        <Tabs.List>
          <Tabs.Tab value="cards" leftSection={<IconCreditCard size={16} />}>
            Loyalty Cards ({loyaltyCards?.length || 0})
          </Tabs.Tab>
          <Tabs.Tab value="coupons" leftSection={<IconTicket size={16} />}>
            Coupons ({coupons.length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="cards" pt="lg">
          <Stack gap="md">
            <Group justify="flex-end">
              <Button leftSection={<IconPlus size={16} />} onClick={openCard}>
                Add Card
              </Button>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              {loyaltyCards?.map((card) => (
                <Paper
                  key={card.id}
                  withBorder
                  p="xl"
                  radius="md"
                  shadow="xs"
                  style={{ overflow: 'hidden' }}
                >
                  <Stack align="center" gap="md">
                    <Group justify="space-between" w="100%">
                      <Text fw={700} size="lg">
                        {card.name}
                      </Text>
                      <Group gap={4}>
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() =>
                            setFullscreenData({
                              name: card.name,
                              number: card.barcode.code,
                              barcodeType: card.barcode.type,
                            })
                          }
                        >
                          <IconMaximize size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => {
                            if (window.confirm('Delete this card?'))
                              deleteCardMutation.mutate(card.id)
                          }}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>

                    <BarcodeDisplay
                      code={card.barcode.code}
                      type={card.barcode.type as 'QR' | 'CODE_128'}
                      size="md"
                      onClick={() =>
                        setFullscreenData({
                          name: card.name,
                          number: card.barcode.code,
                          barcodeType: card.barcode.type,
                        })
                      }
                    />
                    <Text fw={500} ff="monospace">
                      {card.barcode.code}
                    </Text>
                  </Stack>
                </Paper>
              ))}
              {loyaltyCards?.length === 0 && (
                <Text ta="center" py="xl" c="dimmed">
                  No loyalty cards found for this store.
                </Text>
              )}
            </SimpleGrid>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="coupons" pt="lg">
          <Stack gap="md">
            <Group justify="flex-end">
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => {
                  setEditingCoupon(null)
                  openCoupon()
                }}
              >
                Add Coupon
              </Button>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
              {coupons.map((coupon) => {
                const isExpired =
                  coupon.dueDate &&
                  new Date(coupon.dueDate) < new Date(new Date().setHours(0, 0, 0, 0))
                return (
                  <Paper
                    key={coupon.id}
                    withBorder
                    p="md"
                    radius="md"
                    shadow="xs"
                    style={{
                      opacity: coupon.used || isExpired ? 0.6 : 1,
                      backgroundColor: isExpired ? 'var(--mantine-color-red-0)' : undefined,
                    }}
                  >
                    <Stack gap="xs">
                      <Group justify="space-between" wrap="nowrap">
                        <Text fw={700} lineClamp={1}>
                          {coupon.name}
                        </Text>
                        <Group gap={4}>
                          {coupon.used ? (
                            <Badge color="gray">USED</Badge>
                          ) : isExpired ? (
                            <Badge color="red" variant="filled">
                              EXPIRED
                            </Badge>
                          ) : (
                            <Badge color="green">ACTIVE</Badge>
                          )}
                        </Group>
                      </Group>

                      {coupon.value && (
                        <Text fw={800} size="xl" c={isExpired ? 'dimmed' : 'indigo'}>
                          {formatEuro(coupon.value)}
                        </Text>
                      )}

                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {coupon.description}
                      </Text>

                      {coupon.dueDate && (
                        <Group gap={4} wrap="nowrap">
                          <IconCalendar size={14} color={isExpired ? 'red' : 'gray'} />
                          <Text
                            size="xs"
                            c={isExpired ? 'red' : 'dimmed'}
                            fw={isExpired ? 600 : 400}
                          >
                            Expires: {new Date(coupon.dueDate).toLocaleDateString()}
                          </Text>
                        </Group>
                      )}

                      {coupon.barcode?.code && (
                        <>
                          <Divider my="xs" variant="dashed" />
                          <Center>
                            <BarcodeDisplay
                              code={coupon.barcode.code}
                              type={coupon.barcode.type as 'QR' | 'CODE_128'}
                              size="sm"
                              style={{ filter: isExpired ? 'grayscale(1)' : undefined }}
                              onClick={() =>
                                setFullscreenData({
                                  name: coupon.name,
                                  number: coupon.barcode?.code || '',
                                  barcodeType:
                                    (coupon.barcode?.type as 'QR' | 'CODE_128') || 'CODE_128',
                                })
                              }
                            />
                          </Center>
                        </>
                      )}

                      <Group justify="space-between" mt="md">
                        <Button
                          variant="light"
                          size="xs"
                          color={coupon.used ? 'blue' : 'green'}
                          leftSection={
                            coupon.used ? <IconClock size={14} /> : <IconCheck size={14} />
                          }
                          onClick={() =>
                            toggleCouponMutation.mutate({ id: coupon.id, used: !coupon.used })
                          }
                        >
                          {coupon.used ? 'Mark Active' : 'Mark Used'}
                        </Button>
                        <Group gap={4}>
                          <ActionIcon
                            variant="subtle"
                            color="indigo"
                            onClick={() => handleEditCoupon(coupon)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          {coupon.barcode?.code && (
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() =>
                                setFullscreenData({
                                  name: coupon.name,
                                  number: coupon.barcode?.code || '',
                                  barcodeType:
                                    (coupon.barcode?.type as 'QR' | 'CODE_128') || 'CODE_128',
                                })
                              }
                            >
                              <IconMaximize size={16} />
                            </ActionIcon>
                          )}
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => {
                              if (window.confirm('Delete this coupon?'))
                                removeCouponMutation.mutate(coupon.id)
                            }}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Stack>
                  </Paper>
                )
              })}
              {coupons.length === 0 && (
                <Text ta="center" py="xl" c="dimmed">
                  No coupons found for this store.
                </Text>
              )}
            </SimpleGrid>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* Loyalty Card Modal */}
      <AddCardModal
        opened={cardOpened}
        onClose={closeCard}
        onSubmit={(values) => addCardMutation.mutate(values)}
        isPending={addCardMutation.isPending}
      />

      {/* Coupon Modal */}
      <CouponFormModal
        opened={couponOpened}
        onClose={() => {
          closeCoupon()
          setEditingCoupon(null)
        }}
        editingCoupon={editingCoupon}
        onSubmit={handleCouponSubmit}
        isPending={addCouponMutation.isPending || updateCouponMutation.isPending}
      />

      {/* Fullscreen Code View */}
      <FullscreenBarcodeModal
        opened={!!fullscreenData}
        onClose={() => setFullscreenData(null)}
        data={fullscreenData}
      />
    </Stack>
  )
}
