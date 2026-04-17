import { useEffect } from 'react';
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
  Textarea,
  NumberInput,
  Paper,
  Tabs,
  Box,
} from '@mantine/core';
import { IconArrowLeft, IconDeviceFloppy, IconEye, IconPencil } from '@tabler/icons-react';
import { fetchRecipe, createRecipe, updateRecipe } from '../../services/api';
import { notifications } from '@mantine/notifications';
import { MarkdownContent } from '../../components/MarkdownContent';
import { MarkdownEditor } from '../../components/recipes/MarkdownEditor';

export default function RecipeFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      servings: 1,
      prepTimeMinutes: 0,
      sourceLink: '',
      videoLink: '',
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

  useEffect(() => {
    if (recipe) {
      form.setValues({
        name: recipe.name,
        description: recipe.description || '',
        servings: recipe.servings,
        prepTimeMinutes: recipe.prepTimeMinutes,
        sourceLink: recipe.sourceLink || '',
        videoLink: recipe.videoLink || '',
      });
    }
  }, [recipe]);

  const mutation = useMutation({
    mutationFn: (values: typeof form.values) =>
      isEdit ? updateRecipe(Number(id), values) : createRecipe(values),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipe', id] });
      notifications.show({
        title: 'Success',
        message: `Recipe ${isEdit ? 'updated' : 'created'} successfully`,
        color: 'green',
      });
      navigate(`/recipes/${data.id}`);
    },
  });

  if (isLoading) {
    return (
      <Center style={{ height: '50vh' }}>
        <Loader size="xl" />
      </Center>
    );
  }

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
                <NumberInput
                  label="Servings"
                  min={1}
                  required
                  {...form.getInputProps('servings')}
                />
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
    </Container>
  );
}
