import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Modal,
  Stack,
  Text,
  Group,
  Button,
  Select,
  Table,
  Badge,
  Loader,
  Center,
  ScrollArea,
  Divider,
} from '@mantine/core';
import { IconShoppingCart, IconArrowRight, IconAlertCircle } from '@tabler/icons-react';
import { fetchLists, fetchExportPreview, exportMealPlan } from '../../services/api';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import type { ShoppingList } from '../../types/shopping';

interface MealPlanExportModalProps {
  opened: boolean;
  onClose: () => void;
  planId: number;
}

export function MealPlanExportModal({ opened, onClose, planId }: MealPlanExportModalProps) {
  const [targetListId, setTargetListId] = useState<string | null>(null);

  const { data: lists } = useQuery<ShoppingList[]>({
    queryKey: ['shopping-lists'],
    queryFn: () => fetchLists(),
    enabled: opened,
  });

  const { data: preview, isLoading: previewLoading } = useQuery({
    queryKey: ['export-preview', planId, targetListId],
    queryFn: () => fetchExportPreview(planId, targetListId ? Number(targetListId) : undefined),
    enabled: opened,
  });

  const exportMutation = useMutation({
    mutationFn: () => exportMealPlan(planId, Number(targetListId), preview || []),
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Ingredients exported to shopping list', color: 'green' });
      onClose();
    },
  });

  const listOptions = (lists || []).map((l: ShoppingList) => ({
    value: l.id.toString(),
    label: l.name,
  }));

  return (
    <Modal opened={opened} onClose={onClose} title="Export to Shopping List" size="lg">
      <Stack gap="md">
        <Select
          label="Select Target Shopping List"
          placeholder="Choose a list to add ingredients to"
          data={listOptions}
          value={targetListId}
          onChange={setTargetListId}
          required
          leftSection={<IconShoppingCart size={16} />}
        />

        <Divider label="Export Preview" labelPosition="center" />

        <ScrollArea.Autosize mah={400}>
          {previewLoading ? (
            <Center p="xl"><Loader size="sm" /></Center>
          ) : !preview || preview.length === 0 ? (
            <Center p="xl"><Text c="dimmed">No ingredients found in this meal plan.</Text></Center>
          ) : (
            <Table withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Ingredient</Table.Th>
                  <Table.Th>To Add</Table.Th>
                  <Table.Th>Current in List</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {preview.map((item, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>
                      <Text size="sm" fw={500}>{item.itemName}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="blue" variant="light">{item.quantity} {item.unit}</Badge>
                    </Table.Td>
                    <Table.Td>
                      {item.existingQuantity > 0 ? (
                        <Group gap={5}>
                          <Text size="xs">{item.existingQuantity} {item.unit}</Text>
                          <IconArrowRight size={10} />
                          <Text size="xs" fw={700} c="green">{(item.existingQuantity + item.quantity).toFixed(2)} {item.unit}</Text>
                        </Group>
                      ) : (
                        <Text size="xs" c="dimmed">None</Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </ScrollArea.Autosize>

        {!targetListId && (
          <Group gap={5} c="orange">
            <IconAlertCircle size={16} />
            <Text size="xs">Please select a target list to see accurate merge counts.</Text>
          </Group>
        )}

        <Group justify="flex-end" mt="xl">
          <Button variant="subtle" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => exportMutation.mutate()} 
            disabled={!targetListId || !preview || preview.length === 0}
            loading={exportMutation.isPending}
            leftSection={<IconShoppingCart size={18} />}
          >
            Confirm Export
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
