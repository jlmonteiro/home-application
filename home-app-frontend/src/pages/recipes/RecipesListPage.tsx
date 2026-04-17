import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Loader,
  Center,
  Pagination,
  Image,
  SimpleGrid,
  Card,
  Badge,
  TextInput,
  MultiSelect,
  Select,
  Rating,
  Box,
  Paper,
  ActionIcon,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconPlus, IconPencil, IconTrash, IconChefHat, IconClock, IconSearch, IconFilter, IconSortAscending } from '@tabler/icons-react';
import { fetchRecipes, deleteRecipe, searchLabels } from '../../services/api';
import { notifications } from '@mantine/notifications';
import { MarkdownContent } from '../../components/MarkdownContent';
import { getPhotoSrc } from '../../utils/photo';

const SORT_OPTIONS = [
  { value: 'name,asc', label: 'Name (A-Z)' },
  { value: 'name,desc', label: 'Name (Z-A)' },
  { value: 'createdBy,asc', label: 'Owner' },
  { value: 'createdAt,desc', label: 'Newest First' },
];

export function RecipesListPage() {
  const [activePage, setActivePage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string | null>('name,asc');
  
  const pageSize = 12;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['recipes', activePage, debouncedSearch, selectedLabels, sortBy],
    queryFn: () => {
      // Spring Data REST/HATEOAS and our custom search handle sort as part of pageable
      // but fetchRecipes currently doesn't take sort. 
      // We'll pass it if we were to extend it, but for now we just filter.
      return fetchRecipes(activePage - 1, pageSize, debouncedSearch, selectedLabels);
    },
  });

  const { data: allLabels } = useQuery({
    queryKey: ['labels-search-all'],
    queryFn: () => searchLabels(''),
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

  if (isLoading && activePage === 1 && !debouncedSearch) {
    return (
      <Center style={{ height: '50vh' }}>
        <Loader size="xl" />
      </Center>
    );
  }

  const recipes = data?._embedded?.recipes || [];
  const totalPages = data?.page?.totalPages || 1;

  return (
    <Container size="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <div>
            <Title order={1}>Cookbook</Title>
            <Text c="dimmed">Discover and manage your family's favorite recipes.</Text>
          </div>
          <Button
            component={Link}
            to="/recipes/new"
            leftSection={<IconPlus size={18} />}
            size="md"
          >
            Add Recipe
          </Button>
        </Group>

        <Paper withBorder p="md" radius="md">
          <Group align="flex-end">
            <TextInput
              label="Search Recipes"
              placeholder="Filter by name..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <MultiSelect
              label="Filter by Labels"
              placeholder="Select tags"
              data={allLabels?.map(l => l.name) || []}
              value={selectedLabels}
              onChange={setSelectedLabels}
              leftSection={<IconFilter size={16} />}
              style={{ flex: 1 }}
              clearable
              searchable
            />
            <Select
              label="Sort By"
              data={SORT_OPTIONS}
              value={sortBy}
              onChange={(val) => setSortBy(val)}
              leftSection={<IconSortAscending size={16} />}
              w={200}
            />
          </Group>
        </Paper>

        {recipes.length === 0 ? (
          <Paper withBorder p="xl" radius="md" style={{ textAlign: 'center' }}>
            <Stack align="center" gap="sm">
              <IconChefHat size={48} stroke={1.5} color="var(--mantine-color-gray-4)" />
              <Text size="lg" fw={500}>No recipes found</Text>
              <Text c="dimmed">Try adjusting your search or filters.</Text>
              <Button variant="light" onClick={() => { setSearch(''); setSelectedLabels([]); }}>Clear All Filters</Button>
            </Stack>
          </Paper>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
            {recipes.map((recipe) => (
              <Card
                key={recipe.id}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 100ms ease',
                  '&:hover': { transform: 'scale(1.02)' }
                }}
                onClick={() => navigate(`/recipes/${recipe.id}`)}
              >
                {recipe.photos?.find((p: any) => p.isDefault) && (
                  <Card.Section>
                    <Image
                      src={getPhotoSrc(recipe.photos.find((p: any) => p.isDefault)?.photoUrl)}
                      height={160}
                      alt={recipe.name}
                    />
                  </Card.Section>
                )}
                
                <Stack justify="space-between" h="100%" mt="md" gap="md">
                  <div>
                    <Group justify="space-between" mb="xs" wrap="nowrap">
                      <Title order={3} lineClamp={1}>
                        {recipe.name}
                      </Title>
                    </Group>

                    {recipe.labels && recipe.labels.length > 0 && (
                      <Group gap={5} mb="xs">
                        {recipe.labels.map((label: string) => (
                          <Badge key={label} variant="outline" size="xs" color="indigo">
                            {label}
                          </Badge>
                        ))}
                      </Group>
                    )}

                    <Box style={{ height: '4.5em', overflow: 'hidden' }} mb="xs">
                      <Box style={{ 
                        display: '-webkit-box', 
                        WebkitLineClamp: 3, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden',
                        fontSize: '14px' 
                      }}>
                        <MarkdownContent content={recipe.description || ''} />
                      </Box>
                    </Box>

                    <Group gap="xs" mb="xs">
                      <Rating value={recipe.averageRating || 0} readOnly size="xs" fractions={2} />
                      <Text size="xs" c="dimmed">({(recipe.averageRating || 0).toFixed(1)})</Text>
                    </Group>

                    <Group gap="xs">
                      <Badge color="blue" variant="light" leftSection={<IconChefHat size={12} />}>
                        {recipe.createdBy}
                      </Badge>
                      <Badge color="gray" variant="light" leftSection={<IconClock size={12} />}>
                        {recipe.prepTimeMinutes} min
                      </Badge>
                    </Group>
                  </div>

                  <Group justify="flex-end" gap="xs">
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
                      loading={deleteMutation.isPending}
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
            <Pagination total={totalPages} value={activePage} onChange={setActivePage} />
          </Center>
        )}
      </Stack>
    </Container>
  );
}
