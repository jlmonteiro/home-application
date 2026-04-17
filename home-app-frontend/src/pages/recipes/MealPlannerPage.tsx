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
  Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconChevronLeft, 
  IconChevronRight, 
  IconPlus, 
  IconTrash, 
  IconUser, 
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

dayjs.extend(isoWeek);

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
    return plan?.entries.find(e => e.dayOfWeek === day && e.mealTimeId === timeId);
  };

  const handleCellClick = (day: number, timeId: number) => {
    setSelectedCell({ day, timeId });
    setModalOpened(true);
  };

  if (planLoading) return <Center h="50vh"><Loader /></Center>;

  const days = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 7, label: 'Sun' },
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
                      <Text size="xs" c="dimmed">{currentDate.add(day.value - 1, 'day').format('MMM D')}</Text>
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
                    const schedule = time.schedules?.find(s => s.dayOfWeek === day.value);
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

                        {entry && entry.recipes.length > 0 ? (
                          <Stack gap={4}>
                            {Array.from(new Set(entry.recipes.map(r => r.recipeId))).map(rid => {
                              const recipeAssignments = entry.recipes.filter(r => r.recipeId === rid);
                              const recipeName = recipeAssignments[0].recipeName;
                              const userNames = recipeAssignments.map(r => r.userName).filter(Boolean);
                              const multiplier = recipeAssignments[0].multiplier || 1;
                              
                              return (
                                <Paper key={rid} withBorder p={4} radius="xs" bg="white">
                                  <Stack gap={2}>
                                    <Group gap={4} wrap="nowrap" align="center" style={{ overflow: 'hidden' }}>
                                      {multiplier > 1 && (
                                        <Badge size="xs" variant="filled" color="orange" style={{ flex: '0 0 auto' }}>
                                          {multiplier}x
                                        </Badge>
                                      )}
                                      <Text size="xs" fw={700} lineClamp={1} style={{ flex: 1 }}>
                                        {recipeName}
                                      </Text>
                                    </Group>
                                    {userNames.length > 0 && (
                                      <Group gap={2}>
                                        <IconUser size={10} color="var(--mantine-color-blue-6)" />
                                        <Text size="10px" c="blue" lineClamp={1}>
                                          {userNames.join(', ')}
                                        </Text>
                                      </Group>
                                    )}
                                  </Stack>
                                </Paper>
                              );
                            })}
                            
                            <Group gap={4} justify="center" mt={2} wrap="nowrap">
                              {entry.isDone ? (
                                <>
                                  <Badge size="xs" color="green" variant="light" leftSection={<IconCheck size={10} />}>
                                    Done
                                  </Badge>
                                  <Group gap={2} ml="xs">
                                    <Text size="10px" fw={700} c="green">{entry.thumbsUpCount}</Text>
                                    <IconThumbUp size={10} color="var(--mantine-color-green-6)" />
                                    <Text size="10px" fw={700} c="red" ml={4}>{entry.thumbsDownCount}</Text>
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

function MealEntryEditor({ plan, day, timeId, recipes, users, onSave, onToggleDone, onVote, isPending }: MealEntryEditorProps) {
  const existingEntry = plan.entries.find(e => e.dayOfWeek === day && e.mealTimeId === timeId);
  
  const [selections, setSelections] = useState<RecipeSelection[]>(() => {
    if (!existingEntry) return [];
    
    // Group users and multipliers by recipeId
    const groups = new Map<number, { uids: number[], mult: number }>();
    existingEntry.recipes.forEach(r => {
      if (!groups.has(r.recipeId)) groups.set(r.recipeId, { uids: [], mult: r.multiplier || 1 });
      if (r.userId) groups.get(r.recipeId)!.uids.push(r.userId);
    });

    return Array.from(groups.entries()).map(([rid, data]) => ({
      recipeId: String(rid),
      userIds: data.uids.map(String),
      multiplier: data.mult
    }));
  });

  const handleAddRecipe = () => {
    setSelections([...selections, { recipeId: '', userIds: [], multiplier: 1 }]);
  };

  const updateSelection = (index: number, fields: Partial<RecipeSelection>) => {
    const newList = [...selections];
    newList[index] = { ...newList[index], ...fields };
    setSelections(newList);
  };

  const removeSelection = (index: number) => {
    setSelections(selections.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const newPlan = { ...plan };
    const entryIdx = newPlan.entries.findIndex(e => e.dayOfWeek === day && e.mealTimeId === timeId);
    
    const flattenedRecipes: MealPlanEntryRecipe[] = [];
    selections.forEach(sel => {
      if (!sel.recipeId) return;
      
      const rid = Number(sel.recipeId);
      const mult = sel.multiplier;
      
      if (sel.userIds.length === 0) {
        flattenedRecipes.push({ recipeId: rid, multiplier: mult });
      } else {
        sel.userIds.forEach(uid => {
          flattenedRecipes.push({ recipeId: rid, userId: Number(uid), multiplier: mult });
        });
      }
    });

    const entryData: MealPlanEntry = existingEntry 
      ? { ...existingEntry, recipes: flattenedRecipes }
      : { mealTimeId: timeId, dayOfWeek: day, isDone: false, recipes: flattenedRecipes };

    if (entryIdx > -1) {
      newPlan.entries[entryIdx] = entryData;
    } else {
      newPlan.entries.push(entryData);
    }

    onSave(newPlan);
  };

  return (
    <Stack gap="md">
      <Title order={4}>Recipes</Title>
      
      {selections.map((sel, i) => (
        <Paper key={i} withBorder p="xs" radius="md">
          <Stack gap="xs">
            <Group grow wrap="nowrap">
              <Select
                label="Recipe"
                placeholder="Choose recipe"
                data={recipes.map(rec => ({ value: String(rec.id), label: rec.name }))}
                value={sel.recipeId}
                onChange={(val) => updateSelection(i, { recipeId: val || '' })}
                searchable
                comboboxProps={{ zIndex: 4000 }}
                style={{ flex: 1 }}
              />
              <NumberInput
                min={1}
                max={10}
                value={sel.multiplier}
                onChange={(val) => updateSelection(i, { multiplier: Number(val) })}
                w={70}
                label="Qty"
                size="xs"
              />
              <ActionIcon color="red" variant="subtle" onClick={() => removeSelection(i)} mt="xl">
                <IconTrash size={18} />
              </ActionIcon>
            </Group>
            <MultiSelect
              placeholder="Assign to members (empty = everyone)"
              data={users.map(u => ({ value: String(u.id), label: `${u.firstName} ${u.lastName}` }))}
              value={sel.userIds}
              onChange={(vals) => updateSelection(i, { userIds: vals })}
              clearable
              searchable
              comboboxProps={{ zIndex: 4000 }}
            />
          </Stack>
        </Paper>
      ))}

      <Button variant="subtle" leftSection={<IconPlus size={18} />} onClick={handleAddRecipe}>
        Add Recipe to Meal
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
        {existingEntry && (
          <Button variant="outline" color={existingEntry.isDone ? 'gray' : 'green'} onClick={() => onToggleDone(existingEntry)}>
            {existingEntry.isDone ? 'Mark as Undone' : 'Mark as Done'}
          </Button>
        )}
        <Button onClick={handleSave} loading={isPending} style={{ flex: existingEntry ? 0 : 1 }}>
          Save Entry
        </Button>
      </Group>
    </Stack>
  );
}
