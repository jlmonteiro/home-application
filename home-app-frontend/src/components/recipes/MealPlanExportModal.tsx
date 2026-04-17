import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Modal,
  Stack,
  Text,
  Group,
  Button,
  Select,
  Table,
  Loader,
  Center,
  ScrollArea,
  Checkbox,
  NumberInput,
  TextInput,
  Avatar,
  Box,
} from '@mantine/core';
import { IconShoppingCart, IconArrowRight } from '@tabler/icons-react';
import { fetchLists, fetchExportPreview, exportMealPlan, fetchStores } from '../../services/api';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import type { MealPlanExportItem } from '../../types/meals';
import { getPhotoSrc } from '../../utils/photo';

interface MealPlanExportModalProps {
  opened: boolean;
  onClose: () => void;
  planId: number;
}

interface LocalExportItem extends MealPlanExportItem {
  selected: boolean;
  exportQuantity: number;
  targetStoreId: string | null;
}

export function MealPlanExportModal({ opened, onClose, planId }: MealPlanExportModalProps) {
  const [targetListId, setTargetListId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState('');
  const [items, setItems] = useState<LocalExportItem[]>([]);
  
  const queryClient = useQueryClient();

  const { data: lists } = useQuery({
    queryKey: ['shopping-lists'],
    queryFn: () => fetchLists(),
    enabled: opened,
  });

  const { data: stores } = useQuery({
    queryKey: ['shopping-stores-all'],
    queryFn: () => fetchStores(0, 100),
    enabled: opened,
  });

  const { data: preview, isLoading: previewLoading } = useQuery({
    queryKey: ['export-preview', planId, targetListId],
    queryFn: () => fetchExportPreview(planId, targetListId && targetListId !== 'CREATE_NEW' ? Number(targetListId) : undefined),
    enabled: opened,
  });

  // Initialize local items state when preview data arrives
  useEffect(() => {
    if (preview) {
      setItems(preview.map(item => ({
        ...item,
        selected: true,
        exportQuantity: item.quantity,
        targetStoreId: null,
      })));
    }
  }, [preview]);

  const exportMutation = useMutation({
    mutationFn: () => {
      const selectedItems = items
        .filter(i => i.selected)
        .map(i => ({
          itemId: i.itemId,
          itemName: i.itemName,
          quantity: i.exportQuantity,
          unit: i.unit,
          existingQuantity: i.existingQuantity,
          storeId: i.targetStoreId ? Number(i.targetStoreId) : undefined,
        }));

      const isCreateNew = targetListId === 'CREATE_NEW';
      const finalId = isCreateNew ? 0 : Number(targetListId);
      const finalName = isCreateNew ? (newListName.trim() || undefined) : undefined;

      return exportMealPlan(planId, finalId, selectedItems as any, finalName);
    },
    onSuccess: async () => {
      notifications.show({ title: 'Success', message: 'Ingredients exported successfully', color: 'green' });
      
      // Force immediate invalidation and wait for it
      await queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      await queryClient.refetchQueries({ queryKey: ['shopping-lists'] });
      
      onClose();
      // Reset state for next time
      setTargetListId(null);
      setNewListName('');
    },
  });

  const listOptions = [
    ...(lists || []).map(l => ({ value: String(l.id), label: l.name })),
    { value: 'CREATE_NEW', label: '+ Create New List...' }
  ];

  const storeOptions = (stores?._embedded?.stores || []).map(s => ({
    value: String(s.id),
    label: s.name
  }));

  const updateItem = (index: number, fields: Partial<LocalExportItem>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...fields };
    setItems(newItems);
  };

  const canExport = targetListId && 
                    (targetListId !== 'CREATE_NEW' || newListName.trim().length > 0) &&
                    items.some(i => i.selected);

  return (
    <Modal opened={opened} onClose={onClose} title="Export to Shopping List" size="xl" zIndex={3000}>
      <Stack gap="md">
        <Group grow align="flex-end">
          <Select
            label="Select Target Shopping List"
            placeholder="Choose a list"
            data={listOptions}
            value={targetListId}
            onChange={setTargetListId}
            required
            leftSection={<IconShoppingCart size={16} />}
            comboboxProps={{ zIndex: 4000 }}
          />
          {targetListId === 'CREATE_NEW' && (
            <TextInput
              label="New List Name"
              placeholder="e.g. Weekly Groceries"
              value={newListName}
              onChange={(e) => setNewListName(e.currentTarget.value)}
              required
              autoFocus
            />
          )}
        </Group>

        <Divider label="Ingredient Selection" labelPosition="center" />

        <ScrollArea.Autosize mah={500}>
          {previewLoading ? (
            <Center p="xl"><Loader size="sm" /></Center>
          ) : items.length === 0 ? (
            <Center p="xl"><Text c="dimmed">No ingredients found in this meal plan.</Text></Center>
          ) : (
            <Table withTableBorder withColumnBorders verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={40}></Table.Th>
                  <Table.Th>Ingredient</Table.Th>
                  <Table.Th w={120}>Quantity</Table.Th>
                  <Table.Th w={180}>Store</Table.Th>
                  <Table.Th w={120}>Merge Info</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {items.map((item, i) => (
                  <Table.Tr key={i} bg={!item.selected ? 'gray.0' : undefined}>
                    <Table.Td>
                      <Checkbox 
                        checked={item.selected} 
                        onChange={(e) => updateItem(i, { selected: e.currentTarget.checked })} 
                      />
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <Avatar src={getPhotoSrc(item.itemPhoto as any)} size="sm" radius="xs" />
                        <Text size="sm" fw={500} c={!item.selected ? 'dimmed' : undefined}>
                          {item.itemName}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} wrap="nowrap">
                        <NumberInput
                          size="xs"
                          value={item.exportQuantity}
                          onChange={(val) => updateItem(i, { exportQuantity: Number(val) })}
                          min={0}
                          decimalScale={2}
                          w={70}
                          disabled={!item.selected}
                        />
                        <Text size="xs" c="dimmed">{item.unit}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Select
                        size="xs"
                        placeholder="Default Store"
                        data={storeOptions}
                        value={item.targetStoreId}
                        onChange={(val) => updateItem(i, { targetStoreId: val })}
                        clearable
                        disabled={!item.selected}
                        comboboxProps={{ zIndex: 4000 }}
                      />
                    </Table.Td>
                    <Table.Td>
                      {item.selected && item.existingQuantity > 0 ? (
                        <Group gap={4} wrap="nowrap">
                          <Text size="10px" c="dimmed">{item.existingQuantity}</Text>
                          <IconArrowRight size={8} />
                          <Text size="10px" fw={700} c="green">{(item.existingQuantity + item.exportQuantity).toFixed(2)}</Text>
                        </Group>
                      ) : (
                        <Text size="10px" c="dimmed">-</Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </ScrollArea.Autosize>

        <Group justify="flex-end" mt="xl">
          <Button variant="subtle" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => exportMutation.mutate()} 
            disabled={!canExport}
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

const Divider = ({ label, labelPosition, ...props }: any) => (
  <Box my="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)', position: 'relative' }} {...props}>
    {label && (
      <Text
        size="xs"
        fw={700}
        c="dimmed"
        bg="white"
        px="xs"
        style={{
          position: 'absolute',
          top: '50%',
          left: labelPosition === 'center' ? '50%' : '10%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {label}
      </Text>
    )}
  </Box>
);
