import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  Image,
  Tabs,
  Select,
  Center,
  Divider,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
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
  IconBarcode,
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
import { QRCodeSVG } from 'qrcode.react'
import Barcode from 'react-barcode'
import { useState } from 'react'

/**
 * Helper to determine the correct image source for store logos and coupon photos.
 * Handles direct URLs and internal public path.
 */
const getPhotoSrc = (photo: string | undefined | null) => {
  if (!photo) return null
  if (photo.startsWith('http') || photo.startsWith('data:image')) return photo
  if (photo.startsWith('/')) return photo
  return `data:image/png;base64,${photo}`
}

/**
 * Helper to format currency values to Euro.
 */
const formatEuro = (value: string | undefined | null) => {
  if (!value) return ''
  if (value.startsWith('€')) return value
  return `€${value}`
}

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

  // Forms
  const cardForm = useForm({
    initialValues: {
      name: '',
      number: '',
      barcodeType: 'CODE_128' as 'QR' | 'CODE_128',
    },
    validate: {
      name: (v) => (!v ? 'Name is required' : null),
      number: (v) => (!v ? 'Number is required' : null),
    },
  })

  const couponForm = useForm({
    initialValues: {
      name: '',
      description: '',
      value: '',
      dueDate: '',
      code: '',
      barcodeType: 'CODE_128' as 'QR' | 'CODE_128',
    },
    validate: {
      name: (v) => (!v ? 'Name is required' : null),
    },
  })

  // Mutations
  const addCardMutation = useMutation({
    mutationFn: (values: typeof cardForm.values) =>
      createLoyaltyCard(storeId, {
        name: values.name,
        barcode: { code: values.number, type: values.barcodeType },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-cards', storeId] })
      notifications.show({ title: 'Success', message: 'Loyalty card added', color: 'green' })
      closeCard()
      cardForm.reset()
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
    mutationFn: (values: typeof couponForm.values) =>
      createCoupon(storeId, {
        name: values.name,
        description: values.description || undefined,
        value: values.value
          ? values.value.startsWith('€')
            ? values.value
            : `€${values.value}`
          : undefined,
        dueDate: values.dueDate || undefined,
        barcode: values.code ? { code: values.code, type: values.barcodeType } : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', storeId] })
      notifications.show({ title: 'Success', message: 'Coupon added', color: 'green' })
      closeCoupon()
      couponForm.reset()
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
      couponForm.reset()
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
    couponForm.setValues({
      name: coupon.name,
      description: coupon.description || '',
      value: coupon.value?.replace('€', '') || '',
      dueDate: coupon.dueDate ? new Date(coupon.dueDate).toISOString().split('T')[0] : '',
      code: coupon.barcode?.code || '',
      barcodeType: coupon.barcode?.type || 'CODE_128',
    })
    openCoupon()
  }

  const handleCouponSubmit = (values: typeof couponForm.values) => {
    const payload: Partial<Coupon> = {
      name: values.name,
      description: values.description,
      value: values.value
        ? values.value.startsWith('€')
          ? values.value
          : `€${values.value}`
        : values.value,
      dueDate: values.dueDate,
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

                    <Box
                      bg="white"
                      p="md"
                      style={{
                        borderRadius: rem(8),
                        border: '1px solid var(--mantine-color-gray-2)',
                        cursor: 'pointer',
                      }}
                      onClick={() =>
                        setFullscreenData({
                          name: card.name,
                          number: card.barcode.code,
                          barcodeType: card.barcode.type,
                        })
                      }
                    >
                      {card.barcode.type === 'QR' ? (
                        <QRCodeSVG value={card.barcode.code} size={150} />
                      ) : (
                        <Barcode value={card.barcode.code} width={1.5} height={60} fontSize={14} />
                      )}
                    </Box>
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
                  couponForm.reset()
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
                            <Box
                              bg="white"
                              p="xs"
                              style={{
                                borderRadius: rem(4),
                                border: '1px solid var(--mantine-color-gray-2)',
                                cursor: 'pointer',
                                filter: isExpired ? 'grayscale(1)' : undefined,
                              }}
                              onClick={() =>
                                setFullscreenData({
                                  name: coupon.name,
                                  number: coupon.barcode?.code || '',
                                  barcodeType: (coupon.barcode?.type as 'QR' | 'CODE_128') || 'CODE_128',
                                })
                              }
                            >
                              {coupon.barcode.type === 'QR' ? (
                                <QRCodeSVG value={coupon.barcode.code} size={80} />
                              ) : (
                                <Barcode
                                  value={coupon.barcode.code}
                                  width={1}
                                  height={40}
                                  fontSize={10}
                                />
                              )}
                            </Box>
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
                                  number: coupon.barcode.code,
                                  barcodeType: (coupon.barcode?.type as 'QR' | 'CODE_128') || 'CODE_128',
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
      <Modal
        opened={cardOpened}
        onClose={closeCard}
        title="Add Loyalty Card"
        radius="md"
        zIndex={2000}
      >
        <form
          onSubmit={cardForm.onSubmit((v) =>
            addCardMutation.mutate({
              name: v.name,
              barcode: { code: v.number, type: v.barcodeType },
            }),
          )}
        >
          <Stack gap="md">
            <TextInput
              required
              label="Card Name"
              placeholder="e.g. My Clubcard"
              {...cardForm.getInputProps('name')}
            />
            <TextInput
              required
              label="Card Number"
              placeholder="Scan or type number"
              {...cardForm.getInputProps('number')}
            />
            <Select
              label="Barcode Type"
              data={[
                { value: 'CODE_128', label: 'Standard Barcode (CODE128)' },
                { value: 'QR', label: 'QR Code' },
              ]}
              comboboxProps={{ withinPortal: true, zIndex: 3000 }}
              {...cardForm.getInputProps('barcodeType')}
            />
            <Button type="submit" mt="md" loading={addCardMutation.isPending}>
              Add Card
            </Button>
          </Stack>
        </form>
      </Modal>

      {/* Coupon Modal */}
      <Modal
        opened={couponOpened}
        onClose={() => {
          closeCoupon()
          setEditingCoupon(null)
        }}
        title={editingCoupon ? 'Edit Coupon' : 'Add Coupon'}
        radius="md"
        zIndex={2000}
      >
        <form onSubmit={couponForm.onSubmit(handleCouponSubmit)}>
          <Stack gap="md">
            <TextInput
              required
              label="Coupon Name"
              placeholder="e.g. €5 off €25"
              {...couponForm.getInputProps('name')}
            />
            <TextInput
              label="Value"
              placeholder="5.00"
              leftSection={<Text size="sm">€</Text>}
              {...couponForm.getInputProps('value')}
            />
            <Textarea
              label="Description"
              placeholder="Optional details"
              {...couponForm.getInputProps('description')}
            />
            <TextInput label="Due Date" type="date" {...couponForm.getInputProps('dueDate')} />

            <Divider label="Code Details" labelPosition="center" />

            <TextInput
              label="Coupon Code"
              placeholder="Code to scan at checkout"
              leftSection={<IconBarcode size={16} />}
              {...couponForm.getInputProps('code')}
            />
            <Select
              label="Barcode Type"
              data={[
                { value: 'CODE_128', label: 'Standard Barcode (CODE128)' },
                { value: 'QR', label: 'QR Code' },
              ]}
              comboboxProps={{ withinPortal: true, zIndex: 3000 }}
              {...couponForm.getInputProps('barcodeType')}
            />

            <Button
              type="submit"
              mt="md"
              loading={addCouponMutation.isPending || updateCouponMutation.isPending}
            >
              {editingCoupon ? 'Save Changes' : 'Add Coupon'}
            </Button>
          </Stack>
        </form>
      </Modal>

      {/* Fullscreen Code View */}
      <Modal
        opened={!!fullscreenData}
        onClose={() => setFullscreenData(null)}
        title={fullscreenData?.name}
        fullScreen
        zIndex={3000}
      >
        <Center h="100%" pb={rem(100)}>
          <Stack align="center" gap="xl" w="100%">
            <Box
              bg="white"
              p="xl"
              style={{ borderRadius: rem(12), boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}
            >
              {fullscreenData?.barcodeType === 'QR' ? (
                <QRCodeSVG value={fullscreenData.number} size={280} />
              ) : (
                <Box style={{ transform: 'scale(1.5)', transformOrigin: 'center' }} py="xl">
                  <Barcode
                    value={fullscreenData?.number || ''}
                    width={2}
                    height={100}
                    fontSize={16}
                  />
                </Box>
              )}
            </Box>
            <Text size="xl" fw={700} ff="monospace" style={{ letterSpacing: rem(2) }}>
              {fullscreenData?.number}
            </Text>
            <Button size="lg" variant="light" onClick={() => setFullscreenData(null)}>
              Close
            </Button>
          </Stack>
        </Center>
      </Modal>
    </Stack>
  )
}
