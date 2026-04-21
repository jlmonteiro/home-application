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
  Modal,
  Badge,
  Select,
  MultiSelect,
  Divider,
  NumberInput,
  TextInput,
  Box,
  Avatar,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconChevronLeft, 
  IconChevronRight, 
  IconPlus, 
  IconTrash, 
  IconCheck, 
  IconBellRinging,
  IconThumbUp,
  IconThumbDown,
  IconCircleCheck,
  IconShoppingCart,
  IconClock,
} from '@tabler/icons-react';
import { 
  fetchMealPlan, 
  saveMealPlan, 
  fetchMealTimes, 
  fetchRecipes, 
  fetchAllUsers,
  fetchItems,
  notifyHousehold,
  acceptMealPlan,
  voteMealEntry
} from '../../services/api';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import type { MealPlan, MealPlanEntry, MealPlanEntryRecipe } from '../../types/meals';
import { useAuth } from '../../context/AuthContext';
import { MealPlanExportModal } from '../../components/recipes/MealPlanExportModal';
import { getPhotoSrc } from '../../utils/photo';

dayjs.extend(isoWeek);

const getDayValue = (val: any): number => {
  if (typeof val === 'number') return val;
  const dayMap: Record<string, number> = {
    'MONDAY': 0, 'TUESDAY': 1, 'WEDNESDAY': 2, 'THURSDAY': 3,
    'FRIDAY': 4, 'SATURDAY': 5, 'SUNDAY': 6
  };
  return dayMap[String(val).toUpperCase()] ?? 0;
};

export function MealPlannerPage() {
  const [currentDate, setCurrentDate] = useState(dayjs().startOf('isoWeek'));
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ day: number; timeId: number } | null>(null);
  const [exportOpened, { open: openExport, close: closeExport }] = useDisclosure(false);
  useAuth();
  
  const queryClient = useQueryClient();

  const { data: plan, isLoading: planLoading } = useQuery({
    queryKey: ['meal-plan', currentDate.format('YYYY-MM-DD')],
    queryFn: () => fetchMealPlan(currentDate.format('YYYY-MM-DD')),
  });

  const { data: mealTimes } = useQuery({
    queryKey: ['meal-times'],
    queryFn: fetchMealTimes,
  });

  const { data: recipesData } = useQuery({
    queryKey: ['recipes-all'],
    queryFn: () => fetchRecipes(0, 1000),
  });

  const { data: masterItems } = useQuery({
    queryKey: ['shopping-items-all'],
    queryFn: () => fetchItems(0, 1000),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users-all'],
    queryFn: fetchAllUsers,
  });

  const mutation = useMutation({
    mutationFn: saveMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
      setModalOpened(false);
      notifications.show({ title: 'Success', message: 'Meal plan updated', color: 'green' });
    },
  });

  const notifyMutation = useMutation({
    mutationFn: (id: number) => notifyHousehold(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
      notifications.show({ title: 'Household Notified', message: 'Members will receive a notification to review the plan.', color: 'blue' });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (id: number) => acceptMealPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
      notifications.show({ title: 'Plan Accepted', message: 'You have accepted this weekly plan.', color: 'green' });
    },
  });

  const voteMutation = useMutation({
    mutationFn: ({ entryId, vote }: { entryId: number; vote: boolean }) => voteMealEntry(entryId, vote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
    },
  });

  const navigateWeek = (direction: 'next' | 'prev') => {
    setCurrentDate(direction === 'next' ? currentDate.add(1, 'week') : currentDate.subtract(1, 'week'));
  };

  const getEntryFor = (day: number, timeId: number) => {
    return plan?.entries.find(e => getDayValue(e.dayOfWeek) === day && e.mealTimeId === timeId);
  };

  const handleCellClick = (day: number, timeId: number) => {
    setSelectedCell({ day, timeId });
    setModalOpened(true);
  };

  if (planLoading) return <Center h="50vh"><Loader /></Center>;

  const days = [
    { value: 0, label: 'Mon' },
    { value: 1, label: 'Tue' },
    { value: 2, label: 'Wed' },
    { value: 3, label: 'Thu' },
    { value: 4, label: 'Fri' },
    { value: 5, label: 'Sat' },
    { value: 6, label: 'Sun' },
  ];

  const getStatusBadge = () => {
    switch (plan?.status) {
      case 'PENDING': return <Badge color="gray">Draft</Badge>;
      case 'PUBLISHED': return <Badge color="blue">Review Requested</Badge>;
      case 'ACCEPTED': return <Badge color="green">Approved</Badge>;
      case 'CHANGED': return <Badge color="orange">Changes Suggested</Badge>;
      default: return null;
    }
  };

  const recipes = (recipesData as any)?._embedded?.recipes || [];
  const masterItemsList = (masterItems as any)?._embedded?.items || [];
  const users = usersData || [];

  return (
    <Container size="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <Stack gap={5}>
            <Group>
              <Title order={1}>Meal Planner</Title>
              {getStatusBadge()}
            </Group>
            <Text c="dimmed">Plan your family's meals for the week.</Text>
          </Stack>

          <Stack align="flex-end" gap="xs">
            <Group>
              <ActionIcon variant="outline" onClick={() => navigateWeek('prev')}>
                <IconChevronLeft size={18} />
              </ActionIcon>
              <Text fw={700} style={{ width: '200px', textAlign: 'center' }}>
                Week of {currentDate.format('MMM D, YYYY')}
              </Text>
              <ActionIcon variant="outline" onClick={() => navigateWeek('next')}>
                <IconChevronRight size={18} />
              </ActionIcon>
              <Button variant="subtle" onClick={() => setCurrentDate(dayjs().startOf('isoWeek'))}>
                Today
              </Button>
            </Group>

            <Group gap="xs">
              {plan?.status === 'PENDING' && (
                <Button 
                  leftSection={<IconBellRinging size={18} />} 
                  onClick={() => notifyMutation.mutate(plan.id!)}
                  loading={notifyMutation.isPending}
                >
                  Notify Household
                </Button>
              )}
              {plan?.status === 'PUBLISHED' && (
                <Button 
                  color="green" 
                  leftSection={<IconCircleCheck size={18} />} 
                  onClick={() => acceptMutation.mutate(plan.id!)}
                  loading={acceptMutation.isPending}
                >
                  Accept Plan
                </Button>
              )}
              {plan?.id && (
                <Button 
                  variant="light" 
                  color="indigo" 
                  leftSection={<IconShoppingCart size={18} />}
                  onClick={openExport}
                >
                  Export to Shopping List
                </Button>
              )}
            </Group>
          </Stack>
        </Group>

        <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
          <Table withColumnBorders withTableBorder verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={120}>Meal Time</Table.Th>
                {days.map(day => (
                  <Table.Th key={day.value} style={{ textAlign: 'center' }}>
                    <Stack gap={0}>
                      <Text size="sm" fw={700}>{day.label}</Text>
                      <Text size="xs" c="dimmed">{currentDate.add(day.value, 'day').format('MMM D')}</Text>
                    </Stack>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {mealTimes?.map(time => (
                <Table.Tr key={time.id}>
                  <Table.Td fw={700}>{time.name}</Table.Td>
                  {days.map(day => {
                    const entry = getEntryFor(day.value, time.id!);
                    const schedule = time.schedules?.find(s => getDayValue(s.dayOfWeek) === day.value);
                    const timeStr = schedule?.startTime ? schedule.startTime.substring(0, 5) : '--:--';

                    return (
                      <Table.Td 
                        key={day.value} 
                        onClick={() => handleCellClick(day.value, time.id!)}
                        style={{ cursor: 'pointer', verticalAlign: 'top', minHeight: '80px', position: 'relative' }}
                        bg={entry?.isDone ? 'gray.0' : undefined}
                      >
                        <Box pos="absolute" top={2} right={2} style={{ zIndex: 5 }}>
                          <Badge 
                            variant="light" 
                            color="gray" 
                            size="xs" 
                            style={{ 
                              fontSize: '9px', 
                              paddingLeft: '4px', 
                              paddingRight: '4px',
                              backgroundColor: 'rgba(255, 255, 255, 0.7)',
                              backdropFilter: 'blur(2px)'
                            }}
                            leftSection={<IconClock size={10} />}
                          >
                            {timeStr}
                          </Badge>
                        </Box>

                        {(entry && (entry.recipes.length > 0 || entry.items.length > 0)) ? (
                          <Stack gap={4}>
                            {/* Recipes */}
                            {Array.from(new Set(entry.recipes.map(r => r.recipe.id))).map(rid => {
                              const recipeAssignments = entry.recipes.filter(r => r.recipe.id === rid);
                              const recipeName = recipeAssignments[0].recipe.name;
                              const multiplier = recipeAssignments[0].multiplier || 1;
                              
                              return (
                                <Paper key={`recipe-${rid}`} withBorder p={4} radius="xs" bg="white">
                                  <Stack gap={2}>
                                    <Group gap={4} wrap="nowrap" align="center" style={{ overflow: 'hidden' }}>
                                      {multiplier !== 1 && (
                                        <Badge size="xs" variant="filled" color="orange" style={{ flex: '0 0 auto' }}>
                                          {multiplier}x
                                        </Badge>
                                      )}
                                      <Text size="xs" fw={700} lineClamp={1} style={{ flex: 1 }}>
                                        {recipeName}
                                      </Text>
                                    </Group>
                                    {recipeAssignments.some(r => r.users.length > 0) && (
                                      <Group gap={4} mt={2}>
                                        <Avatar.Group spacing="xs">
                                          {Array.from(new Map(recipeAssignments.flatMap(r => r.users).map(u => [u.id, u])).values()).map(user => (
                                            <Tooltip key={user.id} label={user.name} withArrow>
                                              <Avatar 
                                                src={getPhotoSrc(user.photo as any)} 
                                                size={32} 
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
                                  </Stack>
                                </Paper>
                              );
                            })}

                            {/* Direct Items */}
                            {entry.items.map((itemAssignment, idx) => (
                              <Paper key={`item-${idx}`} withBorder p={4} radius="xs" bg="blue.0" style={{ borderColor: 'var(--mantine-color-blue-2)' }}>
                                <Stack gap={2}>
                                  <Group gap={4} wrap="nowrap" align="center" style={{ overflow: 'hidden' }}>
                                    <Badge size="xs" variant="light" color="blue" style={{ flex: '0 0 auto' }}>
                                      {itemAssignment.quantity} {itemAssignment.unit}
                                    </Badge>
                                    <Text size="xs" fw={600} lineClamp={1} style={{ flex: 1 }}>
                                      {itemAssignment.item.name}
                                    </Text>
                                  </Group>
                                  {itemAssignment.users.length > 0 && (
                                    <Group gap={4} mt={2}>
                                      <Avatar.Group spacing="xs">
                                        {itemAssignment.users.map(user => (
                                          <Tooltip key={user.id} label={user.name} withArrow>
                                            <Avatar 
                                              src={getPhotoSrc(user.photo as any)} 
                                              size={24} 
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
                                </Stack>
                              </Paper>
                            ))}
                            
                            <Group gap={4} justify="center" mt={2} wrap="nowrap">
                              {entry.isDone ? (
                                <>
                                  <Badge size="xs" color="green" variant="light" leftSection={<IconCheck size={10} />}>
                                    Done
                                  </Badge>
                                  <Group gap={2} ml="xs">
                                    <Text size="10px" fw={700} c="green">{entry.reactions?.thumbsUp || 0}</Text>
                                    <IconThumbUp size={10} color="var(--mantine-color-green-6)" />
                                    <Text size="10px" fw={700} c="red" ml={4}>{entry.reactions?.thumbsDown || 0}</Text>
                                    <IconThumbDown size={10} color="var(--mantine-color-red-6)" />
                                  </Group>
                                </>
                              ) : (
                                <Text size="xs" c="dimmed">Planned</Text>
                              )}
                            </Group>
                          </Stack>
                        ) : (
                          <Center h={60}>
                            <IconPlus size={14} color="var(--mantine-color-gray-4)" />
                          </Center>
                        )}
                      </Table.Td>
                    );
                  })}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      </Stack>

      <Modal 
        opened={modalOpened} 
        onClose={() => setModalOpened(false)} 
        title="Edit Meal Entry"
        size="md"
        zIndex={3000}
      >
        {selectedCell && (
          <MealEntryEditor 
            plan={plan!}
            day={selectedCell.day}
            timeId={selectedCell.timeId}
            recipes={recipes}
            masterItems={masterItemsList}
            users={users}
            onSave={(updatedPlan) => mutation.mutate(updatedPlan)}
            onToggleDone={(entry) => {
              const newPlan = { ...plan! };
              const entryIdx = newPlan.entries.findIndex(e => e.id === entry.id);
              newPlan.entries[entryIdx] = { ...entry, isDone: !entry.isDone };
              mutation.mutate(newPlan);
            }}
            onVote={(vote) => {
              const entry = getEntryFor(selectedCell.day, selectedCell.timeId);
              if (entry?.id) voteMutation.mutate({ entryId: entry.id, vote });
            }}
            isPending={mutation.isPending}
          />
        )}
      </Modal>

      {plan?.id && (
        <MealPlanExportModal 
          opened={exportOpened} 
          onClose={closeExport} 
          planId={plan.id} 
        />
      )}
    </Container>
  );
}

interface MealEntryEditorProps {
  plan: MealPlan;
  day: number;
  timeId: number;
  recipes: any[];
  masterItems: any[];
  users: any[];
  onSave: (plan: MealPlan) => void;
  onToggleDone: (entry: MealPlanEntry) => void;
  onVote: (vote: boolean) => void;
  isPending: boolean;
}

interface RecipeSelection {
  recipeId: string;
  userIds: string[];
  multiplier: number;
}

interface ItemSelection {
  itemId: string;
  userIds: string[];
  quantity: number;
  unit: string;
}

function MealEntryEditor({ plan, day, timeId, recipes, masterItems, users, onSave, onToggleDone, onVote, isPending }: MealEntryEditorProps) {
  const existingEntry = plan.entries.find(e => getDayValue(e.dayOfWeek) === day && e.mealTimeId === timeId);
  
  const [recipeSelections, setRecipeSelections] = useState<RecipeSelection[]>(() => {
    if (!existingEntry) return [];
    
    // Group users and multipliers by recipe.id
    const groups = new Map<number, { uids: number[], mult: number }>();
    existingEntry.recipes.forEach(r => {
      if (!groups.has(r.recipe.id)) groups.set(r.recipe.id, { uids: [], mult: r.multiplier || 1 });
      r.users.forEach(u => groups.get(r.recipe.id)!.uids.push(u.id));
    });

    return Array.from(groups.entries()).map(([rid, data]) => ({
      recipeId: String(rid),
      userIds: Array.from(new Set(data.uids)).map(String),
      multiplier: data.mult
    }));
  });

  const [itemSelections, setItemSelections] = useState<ItemSelection[]>(() => {
    if (!existingEntry) return [];

    // Group users by item.id and unit
    const groups = new Map<string, { itemId: number, uids: number[], qty: number, unit: string }>();
    existingEntry.items.forEach(i => {
      const key = `${i.item.id}-${i.unit}`;
      if (!groups.has(key)) {
        groups.set(key, { itemId: i.item.id, uids: [], qty: i.quantity, unit: i.unit });
      }
      i.users.forEach(u => groups.get(key)!.uids.push(u.id));
    });

    return Array.from(groups.values()).map(data => ({
      itemId: String(data.itemId),
      userIds: Array.from(new Set(data.uids)).map(String),
      quantity: data.qty,
      unit: data.unit
    }));
  });

  const handleAddRecipe = () => {
    setRecipeSelections([...recipeSelections, { recipeId: '', userIds: [], multiplier: 1 }]);
  };

  const handleAddItem = () => {
    setItemSelections([...itemSelections, { itemId: '', userIds: [], quantity: 1, unit: 'pcs' }]);
  };

  const updateRecipeSelection = (index: number, fields: Partial<RecipeSelection>) => {
    const newList = [...recipeSelections];
    newList[index] = { ...newList[index], ...fields };
    setRecipeSelections(newList);
  };

  const updateItemSelection = (index: number, fields: Partial<ItemSelection>) => {
    const newList = [...itemSelections];
    newList[index] = { ...newList[index], ...fields };
    setItemSelections(newList);
  };

  const removeRecipeSelection = (index: number) => {
    setRecipeSelections(recipeSelections.filter((_, i) => i !== index));
  };

  const removeItemSelection = (index: number) => {
    setItemSelections(itemSelections.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const newPlan = { ...plan };
    const entryIdx = newPlan.entries.findIndex(e => getDayValue(e.dayOfWeek) === day && e.mealTimeId === timeId);
    
    const flattenedRecipes: MealPlanEntryRecipe[] = [];
    recipeSelections.forEach(sel => {
      if (!sel.recipeId) return;
      
      const rid = Number(sel.recipeId);
      const mult = sel.multiplier;
      const recipeName = recipes.find(r => r.id === rid)?.name || '';
      
      if (sel.userIds.length === 0) {
        flattenedRecipes.push({
          recipe: { id: rid, name: recipeName },
          multiplier: mult,
          users: []
        });
      } else {
        sel.userIds.forEach(uid => {
          const user = users.find(u => u.id === Number(uid));
          flattenedRecipes.push({
            recipe: { id: rid, name: recipeName },
            multiplier: mult,
            users: [{ id: Number(uid), name: user ? `${user.firstName} ${user.lastName}` : '' }]
          });
        });
      }
    });

    const flattenedItems: any[] = [];
    itemSelections.forEach(sel => {
      if (!sel.itemId) return;
      
      const itemId = Number(sel.itemId);
      const masterItem = masterItems.find(i => i.id === itemId);
      
      if (sel.userIds.length === 0) {
        flattenedItems.push({
          item: masterItem,
          quantity: sel.quantity,
          unit: sel.unit,
          users: []
        });
      } else {
        sel.userIds.forEach(uid => {
          const user = users.find(u => u.id === Number(uid));
          flattenedItems.push({
            item: masterItem,
            quantity: sel.quantity,
            unit: sel.unit,
            users: [{ id: Number(uid), name: user ? `${user.firstName} ${user.lastName}` : '' }]
          });
        });
      }
    });

    const entryData: MealPlanEntry = existingEntry 
      ? { ...existingEntry, recipes: flattenedRecipes, items: flattenedItems }
      : { mealTimeId: timeId, dayOfWeek: day, isDone: false, recipes: flattenedRecipes, items: flattenedItems };

    if (entryIdx > -1) {
      if (flattenedRecipes.length === 0 && flattenedItems.length === 0) {
        newPlan.entries.splice(entryIdx, 1);
      } else {
        newPlan.entries[entryIdx] = entryData;
      }
    } else if (flattenedRecipes.length > 0 || flattenedItems.length > 0) {
      newPlan.entries.push(entryData);
    }

    onSave(newPlan);
  };

  return (
    <Stack gap="md">
      <Title order={4}>Recipes</Title>
      
      {recipeSelections.map((sel, i) => {
        const otherSelectedIds = recipeSelections
          .filter((_, index) => index !== i)
          .map(s => s.recipeId)
          .filter(Boolean);

        const availableRecipes = recipes
          .filter(rec => !otherSelectedIds.includes(String(rec.id)))
          .map(rec => ({ value: String(rec.id), label: rec.name }));

        return (
          <Paper key={`recipe-sel-${i}`} withBorder p="xs" radius="md">
            <Stack gap="xs">
              <Select
                label="Recipe"
                placeholder="Choose recipe"
                data={availableRecipes}
                value={sel.recipeId}
                onChange={(val) => updateRecipeSelection(i, { recipeId: val || '' })}
                searchable
                comboboxProps={{ zIndex: 4000 }}
              />
              
              <Group wrap="nowrap" align="flex-end">
                <NumberInput
                  min={0.1}
                  max={10}
                  decimalScale={2}
                  step={0.25}
                  value={sel.multiplier}
                  onChange={(val) => updateRecipeSelection(i, { multiplier: Number(val) })}
                  label="Qty"
                  size="xs"
                  style={{ flex: 1 }}
                />
                <ActionIcon color="red" variant="subtle" onClick={() => removeRecipeSelection(i)} mb={4}>
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>

              <MultiSelect
                placeholder="Assign to members (empty = everyone)"
                data={users.map(u => ({ value: String(u.id), label: `${u.firstName} ${u.lastName}` }))}
                value={sel.userIds}
                onChange={(vals) => updateRecipeSelection(i, { userIds: vals })}
                clearable
                searchable
                comboboxProps={{ zIndex: 4000 }}
              />
            </Stack>
          </Paper>
        );
      })}

      <Button variant="subtle" leftSection={<IconPlus size={18} />} onClick={handleAddRecipe}>
        Add Recipe to Meal
      </Button>

      <Divider my="xs" />
      <Title order={4}>Direct Items</Title>

      {itemSelections.map((sel, i) => {
        const otherSelectedIds = itemSelections
          .filter((_, index) => index !== i)
          .map(s => s.itemId)
          .filter(Boolean);

        const availableItems = masterItems
          .filter(it => !otherSelectedIds.includes(String(it.id)))
          .map(it => ({ value: String(it.id), label: it.name }));

        return (
          <Paper key={`item-sel-${i}`} withBorder p="xs" radius="md" bg="blue.0">
            <Stack gap="xs">
              <Select
                label="Item"
                placeholder="Choose item (e.g. Banana)"
                data={availableItems}
                value={sel.itemId}
                onChange={(val) => {
                  const itemId = Number(val);
                  const masterItem = masterItems.find(it => it.id === itemId);
                  updateItemSelection(i, { itemId: val || '', unit: masterItem?.unit || 'pcs' });
                }}
                searchable
                comboboxProps={{ zIndex: 4000 }}
              />
              
              <Group wrap="nowrap" align="flex-end">
                <NumberInput
                  min={0.1}
                  decimalScale={2}
                  value={sel.quantity}
                  onChange={(val) => updateItemSelection(i, { quantity: Number(val) })}
                  label="Qty"
                  size="xs"
                  style={{ flex: 1 }}
                />
                <TextInput
                  label="Unit"
                  value={sel.unit}
                  onChange={(e) => updateItemSelection(i, { unit: e.currentTarget.value })}
                  size="xs"
                  style={{ flex: 1 }}
                />
                <ActionIcon color="red" variant="subtle" onClick={() => removeItemSelection(i)} mb={4}>
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>

              <MultiSelect
                placeholder="Assign to members (empty = everyone)"
                data={users.map(u => ({ value: String(u.id), label: `${u.firstName} ${u.lastName}` }))}
                value={sel.userIds}
                onChange={(vals) => updateItemSelection(i, { userIds: vals })}
                clearable
                searchable
                comboboxProps={{ zIndex: 4000 }}
              />
            </Stack>
          </Paper>
        );
      })}

      <Button variant="subtle" color="blue" leftSection={<IconPlus size={18} />} onClick={handleAddItem}>
        Add Direct Item (Fruit, Snack, etc.)
      </Button>

      <Divider my="sm" />

      {existingEntry?.isDone && (
        <Stack gap="xs">
          <Text size="sm" fw={700}>Rate this meal:</Text>
          <Group>
            <Button 
              variant="light" 
              color="green" 
              leftSection={<IconThumbUp size={16} />}
              onClick={() => onVote(true)}
            >
              Yum!
            </Button>
            <Button 
              variant="light" 
              color="red" 
              leftSection={<IconThumbDown size={16} />}
              onClick={() => onVote(false)}
            >
              Not for me
            </Button>
          </Group>
        </Stack>
      )}

      <Group justify="space-between" mt="md">
        <Box>
          {existingEntry && (recipeSelections.length > 0 || itemSelections.length > 0) && (
            <Button 
              variant="subtle" 
              color="red" 
              leftSection={<IconTrash size={16} />} 
              onClick={() => {
                setRecipeSelections([]);
                setItemSelections([]);
              }}
            >
              Clear Entire Meal
            </Button>
          )}
        </Box>
        
        <Group gap="sm">
          {existingEntry && (
            <Button 
              variant="outline" 
              color={existingEntry.isDone ? 'gray' : 'green'} 
              onClick={() => onToggleDone(existingEntry)}
            >
              {existingEntry.isDone ? 'Mark as Undone' : 'Mark as Done'}
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            loading={isPending} 
            variant="filled" 
            color="blue"
          >
            Save Entry
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}
