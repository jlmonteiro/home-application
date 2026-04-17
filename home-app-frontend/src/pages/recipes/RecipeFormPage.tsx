import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Loader,
  Center,
  TextInput,
  NumberInput,
  Paper,
  Tabs,
  Box,
  TagsInput,
  FileButton,
  Image,
  ActionIcon,
  SimpleGrid,
  Card,
  Table,
  Divider,
  Select,
  Badge,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconEye,
  IconPencil,
  IconUpload,
  IconTrash,
  IconStar,
  IconStarFilled,
  IconPlus,
} from '@tabler/icons-react';
import {
  fetchRecipe,
  createRecipe,
  updateRecipe,
  searchLabels,
  fetchItems,
  fetchCategories,
  createItem,
} from '../../services/api';
import { notifications } from '@mantine/notifications';
import { MarkdownContent } from '../../components/MarkdownContent';
import { MarkdownEditor } from '../../components/recipes/MarkdownEditor';
import { RecipeStepItem } from '../../components/recipes/RecipeStepItem';
import { CreateItemModal, type CreateItemFormValues } from '../../components/shopping/CreateItemModal';
import type { RecipePhoto, RecipeIngredient, RecipeStep } from '../../types/recipes';
import type { ShoppingCategory } from '../../types/shopping';
import { getPhotoSrc } from '../../utils/photo';

export default function RecipeFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [createItemOpened, { open: openCreateItem, close: closeCreateItem }] = useDisclosure(false);
  const [activeIngredientIndex, setActiveIngredientIndex] = useState<number | null>(null);
  
  // Track which step is currently being edited
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      servings: 1,
      prepTimeMinutes: 0,
      sourceLink: '',
      videoLink: '',
      labels: [] as string[],
      photos: [] as RecipePhoto[],
      ingredients: [] as RecipeIngredient[],
      steps: [] as RecipeStep[],
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? 'Name must have at least 2 characters' : null),
      servings: (value) => (value < 1 ? 'Servings must be at least 1' : null),
      prepTimeMinutes: (value) => (value < 0 ? 'Prep time cannot be negative' : null),
    },
  });

  const { data: recipe, isLoading } = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => fetchRecipe(Number(id)),
    enabled: isEdit,
  });

  const { data: allLabels } = useQuery({
    queryKey: ['labels-search', ''],
    queryFn: () => searchLabels(''),
  });

  const { data: masterItems } = useQuery({
    queryKey: ['shopping-items-all'],
    queryFn: () => fetchItems(0, 500),
  });

  const { data: categories } = useQuery({
    queryKey: ['shopping-categories'],
    queryFn: () => fetchCategories(0, 500),
  });

  const categoryOptions = ((categories as any)?._embedded?.categories || []).map((cat: ShoppingCategory) => ({
    value: cat.id.toString(),
    label: cat.name,
  }));

  const createItemMutation = useMutation({
    mutationFn: (values: CreateItemFormValues) =>
      createItem({
        name: values.name,
        category: { id: Number(values.categoryId) } as any,
        unit: values.unit,
        photo: values.photo,
      }),
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items-all'] });
      if (activeIngredientIndex !== null) {
        form.setFieldValue(`ingredients.${activeIngredientIndex}.itemId`, newItem.id);
        form.setFieldValue(`ingredients.${activeIngredientIndex}.unit`, newItem.unit);
      }
      closeCreateItem();
      notifications.show({ title: 'Success', message: 'New master item created', color: 'green' });
    },
  });

  useEffect(() => {
    if (recipe) {
      form.setValues({
        name: recipe.name,
        description: recipe.description || '',
        servings: recipe.servings,
        prepTimeMinutes: recipe.prepTimeMinutes,
        sourceLink: recipe.sourceLink || '',
        videoLink: recipe.videoLink || '',
        labels: recipe.labels || [],
        photos: recipe.photos || [],
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || [],
      });
    }
  }, [recipe]);

  const mutation = useMutation({
    mutationFn: (values: typeof form.values) =>
      isEdit ? updateRecipe(Number(id), values) : createRecipe(values),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipe', id] });
      queryClient.invalidateQueries({ queryKey: ['labels-search'] });
      notifications.show({
        title: 'Success',
        message: `Recipe ${isEdit ? 'updated' : 'created'} successfully`,
        color: 'green',
      });
      navigate(`/recipes/${data.id}`);
    },
  });

  const handlePhotoUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const newPhoto: RecipePhoto = {
        photoUrl: base64,
        isDefault: form.values.photos.length === 0,
      };
      form.setFieldValue('photos', [...form.values.photos, newPhoto]);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...form.values.photos];
    const removedWasDefault = newPhotos[index].isDefault;
    newPhotos.splice(index, 1);
    if (removedWasDefault && newPhotos.length > 0) {
      newPhotos[0].isDefault = true;
    }
    form.setFieldValue('photos', newPhotos);
  };

  const setAsDefault = (index: number) => {
    const newPhotos = form.values.photos.map((p, i) => ({
      ...p,
      isDefault: i === index,
    }));
    form.setFieldValue('photos', newPhotos);
  };

  const addIngredient = () => {
    form.insertListItem('ingredients', { itemId: 0, quantity: 1, unit: '' });
  };

  const addStep = () => {
    const newIndex = form.values.steps.length;
    form.insertListItem('steps', { instruction: '', sortOrder: newIndex });
    setEditingStepIndex(newIndex);
  };

  const moveStep = (from: number, to: number) => {
    const newSteps = [...form.values.steps];
    const [movedStep] = newSteps.splice(from, 1);
    newSteps.splice(to, 0, movedStep);
    
    // Update sort orders
    const updatedSteps = newSteps.map((step, index) => ({
      ...step,
      sortOrder: index,
    }));
    
    form.setFieldValue('steps', updatedSteps);
    
    // Maintain editing index if it was the one moved
    if (editingStepIndex === from) {
      setEditingStepIndex(to);
    } else if (editingStepIndex !== null) {
      // Logic for if something else moved around the editing step
      if (from < editingStepIndex && to >= editingStepIndex) {
        setEditingStepIndex(editingStepIndex - 1);
      } else if (from > editingStepIndex && to <= editingStepIndex) {
        setEditingStepIndex(editingStepIndex + 1);
      }
    }
  };

  if (isLoading) {
    return (
      <Center style={{ height: '50vh' }}>
        <Loader size="xl" />
      </Center>
    );
  }

  const itemOptions = [
    ...(masterItems?._embedded?.items || []).map((item) => ({
      value: item.id.toString(),
      label: item.name,
    })),
    { value: 'CREATE_NEW', label: '+ Create New Item...' },
  ];

  return (
    <Container size="md">
      <Stack gap="xl">
        <Group>
          <Button
            leftSection={<IconArrowLeft size={18} />}
            variant="subtle"
            onClick={() => navigate(isEdit ? `/recipes/${id}` : '/recipes')}
          >
            Cancel
          </Button>
        </Group>

        <Title order={1}>{isEdit ? 'Edit Recipe' : 'New Recipe'}</Title>

        <Paper withBorder p="xl" radius="md">
          <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
            <Stack gap="md">
              <TextInput
                label="Recipe Name"
                placeholder="e.g. Grandma's Lasagna"
                required
                {...form.getInputProps('name')}
              />

              <TagsInput
                label="Labels"
                placeholder="Type and press enter to add tags"
                data={allLabels?.map((l) => l.name) || []}
                {...form.getInputProps('labels')}
                clearable
              />

              <Tabs defaultValue="edit">
                <Tabs.List mb="xs">
                  <Tabs.Tab value="edit" leftSection={<IconPencil size={14} />}>
                    Edit Description
                  </Tabs.Tab>
                  <Tabs.Tab value="preview" leftSection={<IconEye size={14} />}>
                    Preview
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="edit">
                  <MarkdownEditor
                    value={form.values.description}
                    onChange={(val) => form.setFieldValue('description', val)}
                    placeholder="Describe your recipe using Markdown..."
                    minHeight={300}
                  />
                  <Text size="xs" c="dimmed" mt="xs">
                    Supports Markdown for rich formatting.
                  </Text>
                </Tabs.Panel>

                <Tabs.Panel value="preview">
                  <Box
                    p="sm"
                    style={{
                      border: '1px solid var(--mantine-color-gray-3)',
                      borderRadius: 'var(--mantine-radius-sm)',
                      minHeight: '220px',
                    }}
                  >
                    {form.values.description ? (
                      <MarkdownContent content={form.values.description} />
                    ) : (
                      <Text c="dimmed" fs="italic">
                        Nothing to preview.
                      </Text>
                    )}
                  </Box>
                </Tabs.Panel>
              </Tabs>

              <Group grow>
                <NumberInput label="Servings" min={1} required {...form.getInputProps('servings')} />
                <NumberInput
                  label="Prep Time (minutes)"
                  min={0}
                  required
                  {...form.getInputProps('prepTimeMinutes')}
                />
              </Group>

              <TextInput
                label="Source Link"
                placeholder="https://example.com/recipe"
                {...form.getInputProps('sourceLink')}
              />

              <TextInput
                label="Video Link"
                placeholder="https://youtube.com/watch?v=..."
                {...form.getInputProps('videoLink')}
              />

              <Divider my="sm" label="Ingredients" labelPosition="center" />

              <Box>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Item</Table.Th>
                      <Table.Th w={100}>Quantity</Table.Th>
                      <Table.Th w={120}>Unit</Table.Th>
                      <Table.Th w={50}></Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {form.values.ingredients.map((_, index) => (
                      <Table.Tr key={index}>
                        <Table.Td>
                          <Select
                            placeholder="Select item"
                            data={itemOptions}
                            searchable
                            {...form.getInputProps(`ingredients.${index}.itemId`)}
                            onChange={(val) => {
                              if (val === 'CREATE_NEW') {
                                setActiveIngredientIndex(index);
                                openCreateItem();
                              } else {
                                const itemId = Number(val);
                                form.setFieldValue(`ingredients.${index}.itemId`, itemId);
                                // Sync unit from master items
                                const selectedItem = masterItems?._embedded?.items?.find((i: any) => i.id === itemId);
                                if (selectedItem) {
                                  form.setFieldValue(`ingredients.${index}.unit`, selectedItem.unit);
                                }
                              }
                            }}
                            value={form.values.ingredients[index].itemId ? form.values.ingredients[index].itemId.toString() : ''}
                          />
                        </Table.Td>
                        <Table.Td>
                          <NumberInput
                            min={0.1}
                            {...form.getInputProps(`ingredients.${index}.quantity`)}
                          />
                        </Table.Td>
                        <Table.Td>
                          <Box pt={4}>
                            <Badge variant="light" size="lg" radius="sm" w="100%">
                              {form.values.ingredients[index].unit || '-'}
                            </Badge>
                          </Box>
                        </Table.Td>
                        <Table.Td>
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => form.removeListItem('ingredients', index)}
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
                <Button
                  variant="subtle"
                  leftSection={<IconPlus size={18} />}
                  onClick={addIngredient}
                  mt="sm"
                >
                  Add Ingredient
                </Button>
              </Box>

              <Divider my="sm" label="Preparation Steps" labelPosition="center" />

              <Box>
                <Stack gap="xs">
                  {form.values.steps.map((step, index) => (
                    <RecipeStepItem
                      key={index}
                      index={index}
                      totalSteps={form.values.steps.length}
                      instruction={step.instruction}
                      timeMinutes={step.timeMinutes}
                      isEditing={editingStepIndex === index}
                      onEdit={() => setEditingStepIndex(index)}
                      onInstructionChange={(val) =>
                        form.setFieldValue(`steps.${index}.instruction`, val)
                      }
                      onTimeChange={(val) =>
                        form.setFieldValue(`steps.${index}.timeMinutes`, Number(val))
                      }
                      onRemove={() => {
                        form.removeListItem('steps', index);
                        setEditingStepIndex(null);
                      }}
                      onConfirm={() => setEditingStepIndex(null)}
                      onMoveUp={() => moveStep(index, index - 1)}
                      onMoveDown={() => moveStep(index, index + 1)}
                    />
                  ))}
                </Stack>

                <Button
                  variant="subtle"
                  leftSection={<IconPlus size={18} />}
                  onClick={addStep}
                  mt="sm"
                >
                  Add Step
                </Button>
              </Box>

              <Divider my="sm" label="Photos" labelPosition="center" />

              <Box>
                <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
                  {form.values.photos.map((photo, index) => (
                    <Card key={index} withBorder padding={0} radius="md" pos="relative">
                      <Image src={getPhotoSrc(photo.photoUrl)} height={120} fit="cover" radius="md" />
                      <Group gap={5} pos="absolute" top={5} right={5}>
                        <ActionIcon
                          color={photo.isDefault ? 'yellow' : 'gray'}
                          variant="filled"
                          size="sm"
                          onClick={() => setAsDefault(index)}
                          title={photo.isDefault ? 'Default Photo' : 'Set as Default'}
                        >
                          {photo.isDefault ? <IconStarFilled size={14} /> : <IconStar size={14} />}
                        </ActionIcon>
                        <ActionIcon
                          color="red"
                          variant="filled"
                          size="sm"
                          onClick={() => removePhoto(index)}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </Card>
                  ))}
                  <FileButton onChange={handlePhotoUpload} accept="image/png,image/jpeg">
                    {(props) => (
                      <Button {...props} variant="outline" h={120} style={{ borderStyle: 'dashed' }}>
                        <Stack align="center" gap={5}>
                          <IconUpload size={24} />
                          <Text size="xs">Upload Photo</Text>
                        </Stack>
                      </Button>
                    )}
                  </FileButton>
                </SimpleGrid>
              </Box>

              <Group justify="flex-end" mt="xl">
                <Button
                  type="submit"
                  loading={mutation.isPending}
                  leftSection={<IconDeviceFloppy size={18} />}
                >
                  {isEdit ? 'Update Recipe' : 'Create Recipe'}
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Stack>

      <CreateItemModal
        opened={createItemOpened}
        onClose={closeCreateItem}
        categoryOptions={categoryOptions}
        initialName=""
        onSubmit={(values) => createItemMutation.mutate(values)}
        isPending={createItemMutation.isPending}
      />
    </Container>
  );
}
