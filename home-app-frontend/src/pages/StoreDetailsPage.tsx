import {
  Title,
  Text,
  Button,
  Group,
  Stack,
  ActionIcon,
  Modal,
  TextInput,
  Select,
  LoadingOverlay,
  Avatar,
  Card,
  SimpleGrid,
  Tabs,
  Badge,
  Paper,
  Textarea,
  Box,
  Image,
  rem,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { useParams, Link } from 'react-router-dom'
import * as TablerIcons from '@tabler/icons-react'
import Barcode from 'react-barcode'
import { QRCodeSVG } from 'qrcode.react'
import { 
  IconArrowLeft, 
  IconPlus, 
  IconTrash, 
  IconCreditCard, 
  IconTicket, 
  IconCalendar,
  IconQuestionMark,
  IconCheck
} from '@tabler/icons-react'
import { 
  fetchStore, 
  fetchLoyaltyCards, 
  createLoyaltyCard, 
  deleteLoyaltyCard,
  fetchCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../services/api'
import type { LoyaltyCard as LoyaltyCardType, Coupon } from '../services/api'

/**
 * Helper to determine the correct image source for store logos.
 * Handles direct URLs, local logo paths, and Base64 strings.
 */
const getPhotoSrc = (photo: string | undefined | null) => {
  if (!photo) return null
  if (photo.startsWith('http') || photo.startsWith('data:image') || photo.startsWith('/logos/')) return photo
  // Fallback for raw base64 data
  return `data:image/png;base64,${photo}`
}

export function StoreDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const storeId = parseInt(id!)
  const queryClient = useQueryClient()
  
  const [cardModalOpened, { open: openCardModal, close: closeCardModal }] = useDisclosure(false)
  const [couponModalOpened, { open: openCouponModal, close: closeCouponModal }] = useDisclosure(false)

  // Queries Section
  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['shopping-store', storeId],
    queryFn: () => fetchStore(storeId),
  })

  const { data: cards, isLoading: cardsLoading } = useQuery({
    queryKey: ['shopping-cards', storeId],
    queryFn: () => fetchLoyaltyCards(storeId),
  })

  const { data: couponsData, isLoading: couponsLoading } = useQuery({
    queryKey: ['shopping-coupons', storeId],
    queryFn: () => fetchCoupons(storeId),
  })

  // Forms Section
  const cardForm = useForm({
    initialValues: {
      name: '',
      number: '',
      barcodeType: 'CODE_128',
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
      photo: '',
    },
    validate: {
      name: (v) => (!v ? 'Name is required' : null),
    },
  })

  // Mutations Section
  const createCardMutation = useMutation({
    mutationFn: (values: any) => createLoyaltyCard(storeId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-cards', storeId] })
      notifications.show({ title: 'Success', message: 'Card added', color: 'green' })
      closeCardModal()
      cardForm.reset()
    }
  })

  const deleteCardMutation = useMutation({
    mutationFn: deleteLoyaltyCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-cards', storeId] })
      notifications.show({ title: 'Success', message: 'Card removed', color: 'green' })
    }
  })

  const createCouponMutation = useMutation({
    mutationFn: (values: any) => createCoupon(storeId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-coupons', storeId] })
      notifications.show({ title: 'Success', message: 'Coupon added', color: 'green' })
      closeCouponModal()
      couponForm.reset()
    }
  })

  const toggleCouponUsedMutation = useMutation({
    mutationFn: ({ id, used }: { id: number; used: boolean }) => updateCoupon(id, { used }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-coupons', storeId] })
    }
  })

  const deleteCouponMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-coupons', storeId] })
      notifications.show({ title: 'Success', message: 'Coupon removed', color: 'green' })
    }
  })

  if (storeLoading) return <LoadingOverlay visible />
  if (!store) return <Text>Store not found</Text>

  const StoreIcon = (TablerIcons as any)[store.icon || 'IconBuildingStore'] || IconQuestionMark
  const coupons = couponsData?._embedded?.coupons || []

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Button 
          variant="subtle" 
          leftSection={<IconArrowLeft size={16} />} 
          component={Link} 
          to="/shopping/stores"
        >
          Back to Stores
        </Button>
      </Group>

      <Paper p="xl" radius="md" withBorder>
        <Group align="flex-start" gap="xl">
          <Box w={120} h={120} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--mantine-color-gray-3)', borderRadius: rem(8), overflow: 'hidden' }}>
            {store.photo ? (
              <Image 
                src={getPhotoSrc(store.photo)} 
                fit="contain" 
                h={120} 
                w={120} 
              />
            ) : (
              <StoreIcon size={64} stroke={1.5} color="var(--mantine-color-gray-4)" />
            )}
          </Box>
          <Stack gap={4} style={{ flex: 1 }}>
            <Title order={1}>{store.name}</Title>
            <Text c="dimmed">{store.description || 'No description provided.'}</Text>
          </Stack>
        </Group>
      </Paper>

      <Tabs defaultValue="cards">
        <Tabs.List>
          <Tabs.Tab value="cards" leftSection={<IconCreditCard size={16} />}>
            Loyalty Cards
          </Tabs.Tab>
          <Tabs.Tab value="coupons" leftSection={<IconTicket size={16} />}>
            Coupons
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="cards" pt="lg">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>Household Loyalty Cards</Title>
              <Button leftSection={<IconPlus size={16} />} onClick={openCardModal}>Add Card</Button>
            </Group>

            {cardsLoading ? <LoadingOverlay visible /> : (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                {cards?.map((card: LoyaltyCardType) => (
                  <Card key={card.id} withBorder radius="md" p="md" shadow="sm">
                    <Group justify="space-between" mb="xs">
                      <Text fw={700}>{card.name}</Text>
                      <ActionIcon variant="subtle" color="red" onClick={() => deleteCardMutation.mutate(card.id)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                    
                    <Stack align="center" gap="sm" py="md">
                      {card.barcodeType === 'QR' ? (
                        <QRCodeSVG value={card.number} size={120} />
                      ) : (
                        <Barcode value={card.number} width={1.5} height={50} fontSize={14} />
                      )}
                      <Text size="sm" ff="monospace" fw={500}>{card.number}</Text>
                    </Stack>
                  </Card>
                ))}
                {cards?.length === 0 && <Text c="dimmed">No loyalty cards found for this store.</Text>}
              </SimpleGrid>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="coupons" pt="lg">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>Discount Coupons</Title>
              <Button leftSection={<IconPlus size={16} />} onClick={openCouponModal}>Add Coupon</Button>
            </Group>

            {couponsLoading ? <LoadingOverlay visible /> : (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                {coupons.map((coupon: Coupon) => (
                  <Card key={coupon.id} withBorder radius="md" p="md" shadow="sm" style={{ opacity: coupon.used ? 0.6 : 1 }}>
                    <Group justify="space-between" mb="xs" wrap="nowrap">
                      <Text fw={700} lineClamp={1}>{coupon.name}</Text>
                      <Group gap={4}>
                        <ActionIcon 
                          variant={coupon.used ? 'filled' : 'light'} 
                          color="green" 
                          onClick={() => toggleCouponUsedMutation.mutate({ id: coupon.id, used: !coupon.used })}
                        >
                          <IconCheck size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="red" onClick={() => deleteCouponMutation.mutate(coupon.id)}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>

                    <Stack gap={8}>
                      {coupon.value && (
                        <Badge color="indigo" variant="light" size="lg" fullWidth radius="sm">
                          {coupon.value}
                        </Badge>
                      )}
                      
                      {coupon.description && <Text size="sm">{coupon.description}</Text>}
                      
                      {coupon.dueDate && (
                        <Group gap={4} mt="xs">
                          <IconCalendar size={14} color="gray" />
                          <Text size="xs" c={new Date(coupon.dueDate) < new Date() ? 'red' : 'dimmed'}>
                            Due: {new Date(coupon.dueDate).toLocaleDateString()}
                          </Text>
                        </Group>
                      )}
                    </Stack>
                  </Card>
                ))}
                {coupons.length === 0 && <Text c="dimmed">No coupons found for this store.</Text>}
              </SimpleGrid>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* Modals */}
      <Modal opened={cardModalOpened} onClose={closeCardModal} title="Add Loyalty Card" radius="md" zIndex={2000}>
        <form onSubmit={cardForm.onSubmit((v) => createCardMutation.mutate(v))}>
          <Stack gap="md">
            <TextInput required label="Card Name" placeholder="e.g. My Rewards" {...cardForm.getInputProps('name')} />
            <TextInput required label="Card Number" placeholder="Numbers or alphanumeric code" {...cardForm.getInputProps('number')} />
            <Select 
              label="Barcode Type" 
              data={[{ value: 'CODE_128', label: 'Standard Barcode (Code 128)' }, { value: 'QR', label: 'QR Code' }]}
              comboboxProps={{ withinPortal: true, zIndex: 3000 }}
              {...cardForm.getInputProps('barcodeType')}
            />
            <Button type="submit" mt="md" loading={createCardMutation.isPending}>Add Card</Button>
          </Stack>
        </form>
      </Modal>

      <Modal opened={couponModalOpened} onClose={closeCouponModal} title="Add Coupon" radius="md" zIndex={2000}>
        <form onSubmit={couponForm.onSubmit((v) => createCouponMutation.mutate(v))}>
          <Stack gap="md">
            <TextInput required label="Coupon Name" placeholder="e.g. 20% Discount" {...couponForm.getInputProps('name')} />
            <TextInput label="Value" placeholder="e.g. $10, 20%, Buy 1 Get 1" {...couponForm.getInputProps('value')} />
            <TextInput label="Due Date" type="datetime-local" {...couponForm.getInputProps('dueDate')} />
            <Textarea label="Description" placeholder="Any details or restrictions" {...couponForm.getInputProps('description')} />
            <TextInput label="Photo URL" placeholder="https://..." {...couponForm.getInputProps('photo')} />
            <Button type="submit" mt="md" loading={createCouponMutation.isPending}>Add Coupon</Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  )
}
