import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Loader,
  Center,
  Paper,
  Table,
  ActionIcon,
  TextInput,
  NumberInput,
  Modal,
  Divider,
} from '@mantine/core';
import { IconPlus, IconTrash, IconPencil, IconDeviceFloppy, IconArrowLeft, IconClock } from '@tabler/icons-react';
import { fetchMealTimes, saveMealTime, deleteMealTime } from '../../services/api';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import type { MealTime, MealTimeSchedule } from '../../types/meals';
import { TimeInput } from '@mantine/dates';
import { useNavigate } from 'react-router-dom';

const DAYS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
];

export function MealTimesPage() {
  const [modalOpened, setModalOpened] = useState(false);
  const [editingMealTime, setEditingMealTime] = useState<MealTime | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: mealTimes, isLoading } = useQuery({
    queryKey: ['meal-times'],
    queryFn: fetchMealTimes,
  });

  const form = useForm({
    initialValues: {
      name: '',
      sortOrder: 0,
      schedules: [] as MealTimeSchedule[],
    },
    validate: {
      name: (val) => (val.trim().length < 2 ? 'Name too short' : null),
    },
  });

  const mutation = useMutation({
    mutationFn: saveMealTime,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-times'] });
      setModalOpened(false);
      notifications.show({ title: 'Success', message: 'Meal time saved', color: 'green' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMealTime,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-times'] });
      notifications.show({ title: 'Success', message: 'Meal time deleted', color: 'green' });
    },
  });

  const handleEdit = (mealTime: MealTime) => {
    setEditingMealTime(mealTime);
    form.setValues({
      name: mealTime.name,
      sortOrder: mealTime.sortOrder,
      schedules: mealTime.schedules || [],
    });
    setModalOpened(true);
  };

  const handleAdd = () => {
    setEditingMealTime(null);
    form.setValues({
      name: '',
      sortOrder: (mealTimes?.length || 0) + 1,
      schedules: DAYS.map(d => ({ dayOfWeek: d.value as any, startTime: '08:00' })),
    });
    setModalOpened(true);
  };

  if (isLoading) return <Center h="50vh"><Loader /></Center>;

  return (
    <Container size="md">
      <Stack gap="xl">
        <Group justify="space-between">
          <Button variant="subtle" leftSection={<IconArrowLeft size={18} />} onClick={() => navigate('/settings')}>
            Back to Settings
          </Button>
          <Button leftSection={<IconPlus size={18} />} onClick={handleAdd}>
            Add Meal Time
          </Button>
        </Group>

        <Title order={1}>Meal Time Configuration</Title>
        <Text c="dimmed">Define when meals occur during the day for each day of the week.</Text>

        <Paper withBorder radius="md">
          <Table verticalSpacing="md" horizontalSpacing="lg">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th w={100}>Order</Table.Th>
                <Table.Th w={120}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {mealTimes?.map((mt) => (
                <Table.Tr key={mt.id}>
                  <Table.Td>
                    <Text fw={500}>{mt.name}</Text>
                    <Group gap={5} mt={5}>
                      {mt.schedules?.length > 0 && (
                        <Text size="xs" c="dimmed">
                          {mt.schedules.length} schedules configured
                        </Text>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>{mt.sortOrder}</Table.Td>
                  <Table.Td>
                    <Group gap={0} justify="flex-end">
                      <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(mt)}>
                        <IconPencil size={18} />
                      </ActionIcon>
                      <ActionIcon 
                        variant="subtle" 
                        color="red" 
                        onClick={() => {
                          if (window.confirm('Delete this meal time and all its schedules?')) {
                            deleteMutation.mutate(mt.id!);
                          }
                        }}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      </Stack>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={editingMealTime ? 'Edit Meal Time' : 'Add Meal Time'}
        size="lg"
        zIndex={3000}
      >
        <form onSubmit={form.onSubmit((values) => mutation.mutate({ ...editingMealTime, ...values }))}>
          <Stack gap="md">
            <Group grow>
              <TextInput label="Name" placeholder="e.g. Breakfast" required {...form.getInputProps('name')} />
              <NumberInput label="Sort Order" {...form.getInputProps('sortOrder')} />
            </Group>

            <Divider label="Weekly Schedule" labelPosition="center" my="sm" />

            <Table variant="vertical">
              <Table.Tbody>
                {form.values.schedules.map((_, index) => (
                  <Table.Tr key={index}>
                    <Table.Td w={150}>
                      <Text size="sm" fw={500}>
                        {DAYS.find(d => d.value === form.values.schedules[index].dayOfWeek)?.label}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <TimeInput
                        size="xs"
                        leftSection={<IconClock size={16} />}
                        {...form.getInputProps(`schedules.${index}.startTime`)}
                      />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            <Group justify="flex-end" mt="xl">
              <Button type="submit" loading={mutation.isPending} leftSection={<IconDeviceFloppy size={18} />}>
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
