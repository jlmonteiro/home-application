import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Loader,
  Center,
  Badge,
  Paper,
  Divider,
} from '@mantine/core';
import { IconArrowLeft, IconPencil, IconChefHat, IconClock, IconUsers, IconLink, IconVideo } from '@tabler/icons-react';
import { fetchRecipe } from '../../services/api';
import { MarkdownContent } from '../../components/MarkdownContent';

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: recipe, isLoading, error } = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => fetchRecipe(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Center style={{ height: '50vh' }}>
        <Loader size="xl" />
      </Center>
    );
  }

  if (error || !recipe) {
    return (
      <Container size="xl">
        <Text color="red">Failed to load recipe detail. It may have been deleted.</Text>
        <Button leftSection={<IconArrowLeft size={18} />} variant="subtle" onClick={() => navigate('/recipes')} mt="md">
          Back to Cookbook
        </Button>
      </Container>
    );
  }

  return (
    <Container size="lg">
      <Stack gap="xl">
        <Group justify="space-between">
          <Button
            leftSection={<IconArrowLeft size={18} />}
            variant="subtle"
            onClick={() => navigate('/recipes')}
          >
            Back
          </Button>
          <Button
            leftSection={<IconPencil size={18} />}
            variant="outline"
            onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
          >
            Edit Recipe
          </Button>
        </Group>

        <Paper withBorder p="xl" radius="md">
          <Stack gap="lg">
            <div>
              <Title order={1}>{recipe.name}</Title>
              <Group gap="sm" mt="xs">
                <Badge color="blue" leftSection={<IconChefHat size={14} />}>
                  By {recipe.createdBy}
                </Badge>
                <Badge color="gray" leftSection={<IconClock size={14} />}>
                  {recipe.prepTimeMinutes} min
                </Badge>
                <Badge color="gray" leftSection={<IconUsers size={14} />}>
                  {recipe.servings} servings
                </Badge>
              </Group>
            </div>

            <Group gap="md">
              {recipe.sourceLink && (
                <Button
                  component="a"
                  href={recipe.sourceLink}
                  target="_blank"
                  leftSection={<IconLink size={18} />}
                  variant="light"
                  size="xs"
                >
                  Source
                </Button>
              )}
              {recipe.videoLink && (
                <Button
                  component="a"
                  href={recipe.videoLink}
                  target="_blank"
                  leftSection={<IconVideo size={18} />}
                  variant="light"
                  color="red"
                  size="xs"
                >
                  Video
                </Button>
              )}
            </Group>

            <Divider />

            <div>
              <Title order={3} mb="md">Description</Title>
              {recipe.description ? (
                <MarkdownContent content={recipe.description} />
              ) : (
                <Text c="dimmed" fs="italic">No description provided.</Text>
              )}
            </div>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
