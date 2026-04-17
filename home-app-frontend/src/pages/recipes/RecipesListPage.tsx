import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Card,
  SimpleGrid,
  ActionIcon,
  Badge,
  Stack,
  Loader,
  Center,
  Pagination,
  Image as MantineImage,
} from '@mantine/core';
import { IconPlus, IconPencil, IconTrash, IconChefHat, IconClock } from '@tabler/icons-react';
import { fetchRecipes, deleteRecipe } from '../../services/api';
import { notifications } from '@mantine/notifications';

export default function RecipesListPage() {
  const [activePage, setPage] = useState(1);
  const pageSize = 12;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['recipes', activePage],
    queryFn: () => fetchRecipes(activePage - 1, pageSize),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      notifications.show({
        title: 'Success',
        message: 'Recipe deleted successfully',
        color: 'green',
      });
    },
  });

  if (isLoading) {
    return (
      <Center style={{ height: '50vh' }}>
        <Loader size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container size="xl">
        <Text color="red">Failed to load recipes. Please try again later.</Text>
      </Container>
    );
  }

  const recipes = data?._embedded?.recipes || [];
  const totalPages = data?.page?.totalPages || 1;

  return (
    <Container size="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <div>
            <Title order={1}>Cookbook</Title>
            <Text c="dimmed">Manage and discover shared family recipes.</Text>
          </div>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => navigate('/recipes/new')}
            variant="filled"
          >
            New Recipe
          </Button>
        </Group>

        {recipes.length === 0 ? (
          <Card withBorder padding="xl" radius="md">
            <Stack align="center" gap="md">
              <IconChefHat size={48} stroke={1.5} color="var(--mantine-color-dimmed)" />
              <Text c="dimmed">No recipes found. Start by creating your first family recipe!</Text>
              <Button variant="outline" onClick={() => navigate('/recipes/new')}>
                Add Recipe
              </Button>
            </Stack>
          </Card>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {recipes.map((recipe) => (
              <Card
                key={recipe.id}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/recipes/${recipe.id}`)}
              >
                {recipe.photos?.find(p => p.isDefault) && (
                  <Card.Section>
                    <MantineImage
                      src={recipe.photos.find(p => p.isDefault)?.photoData}
                      height={160}
                      alt={recipe.name}
                    />
                  </Card.Section>
                )}
                <Stack justify="space-between" h="100%" mt="md">
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Title order={3} lineClamp={1}>
                        {recipe.name}
                      </Title>
                    </Group>

                    {recipe.labels && recipe.labels.length > 0 && (
                      <Group gap={5} mb="xs">
                        {recipe.labels.map(label => (
                          <Badge key={label} variant="outline" size="xs" color="indigo">
                            {label}
                          </Badge>
                        ))}
                      </Group>
                    )}

                    <Group gap="xs" mb="md">
                      <Badge color="blue" variant="light" leftSection={<IconChefHat size={12} />}>
                        {recipe.createdBy}
                      </Badge>
                      <Badge color="gray" variant="light" leftSection={<IconClock size={12} />}>
                        {recipe.prepTimeMinutes} min
                      </Badge>
                    </Group>

                    <Text size="sm" c="dimmed" lineClamp={3}>
                      {recipe.description || 'No description provided.'}
                    </Text>
                  </div>

                  <Group justify="flex-end" mt="md">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/recipes/${recipe.id}/edit`);
                      }}
                    >
                      <IconPencil size={18} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this recipe?')) {
                          deleteMutation.mutate(recipe.id);
                        }
                      }}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        )}

        {totalPages > 1 && (
          <Center mt="xl">
            <Pagination total={totalPages} value={activePage} onChange={setPage} />
          </Center>
        )}
      </Stack>
    </Container>
  );
}
