import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
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
  Textarea,
  Modal,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconArrowLeft,
  IconDeviceFloppy,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { fetchAllNutrients, saveNutrient, deleteNutrient } from '../../services/api';
import type { Nutrient } from '../../types/recipes';

export function NutrientSettingsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingNutrient, setEditingNutrient] = useState<Nutrient | null>(null);

  const { data: nutrients, isLoading } = useQuery({
    queryKey: ['nutrients-master'],
    queryFn: fetchAllNutrients,
  });

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      unit: '',
    },
    validate: {
      name: (v) => (!v ? 'Name is required' : null),
      unit: (v) => (!v ? 'Unit is required' : null),
    },
  });

  const mutation = useMutation({
    mutationFn: saveNutrient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrients-master'] });
      notifications.show({ title: 'Success', message: 'Nutrient definition saved', color: 'green' });
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNutrient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrients-master'] });
      notifications.show({ title: 'Success', message: 'Nutrient deleted', color: 'green' });
    },
  });

  const handleEdit = (nutrient: Nutrient) => {
    setEditingNutrient(nutrient);
    form.setValues({
      name: nutrient.name,
      description: nutrient.description || '',
      unit: nutrient.unit,
    });
    open();
  };

  const handleClose = () => {
    close();
    setEditingNutrient(null);
    form.reset();
  };

  const handleSubmit = (values: typeof form.values) => {
    mutation.mutate({ ...editingNutrient, ...values });
  };

  if (isLoading) return <Center h="50vh"><Loader /></Center>;

  return (
    <Container size="md">
      <Stack gap="xl">
        <Group justify="space-between">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={18} />}
            onClick={() => navigate('/settings')}
          >
            Back to Settings
          </Button>
          <Button leftSection={<IconPlus size={18} />} onClick={open}>
            Add Nutrient
          </Button>
        </Group>

        <div>
          <Title order={1}>Nutrient Definitions</Title>
          <Text c="dimmed">Manage the global list of nutrients available for items and recipes.</Text>
        </div>

        <Paper withBorder radius="md">
          <Table verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Default Unit</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th w={100} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {nutrients?.map((n) => (
                <Table.Tr key={n.id}>
                  <Table.Td fw={500}>{n.name}</Table.Td>
                  <Table.Td>
                    <Text size="sm">{n.unit}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {n.description || '-'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4} justify="flex-end">
                      <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(n)}>
                        <IconPencil size={18} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => {
                          if (window.confirm('Delete this nutrient definition? This might affect existing item data.')) {
                            deleteMutation.mutate(n.id!);
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
        opened={opened}
        onClose={handleClose}
        title={editingNutrient ? 'Edit Nutrient' : 'Add Nutrient'}
        radius="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Nutrient Name"
              placeholder="e.g. Vitamin B12, Fibre"
              required
              {...form.getInputProps('name')}
            />
            <TextInput
              label="Measurement Unit"
              placeholder="e.g. g, mg, µg, kcal"
              required
              {...form.getInputProps('unit')}
            />
            <Textarea
              label="Description"
              placeholder="Optional nutritional information"
              {...form.getInputProps('description')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={handleClose}>Cancel</Button>
              <Button type="submit" loading={mutation.isPending} leftSection={<IconDeviceFloppy size={18} />}>
                Save Definition
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
