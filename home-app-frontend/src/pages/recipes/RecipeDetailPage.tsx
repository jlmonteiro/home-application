import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
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
  Image,
  SimpleGrid,
  Card,
  Table,
  Avatar,
  Box,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconPencil,
  IconChefHat,
  IconClock,
  IconUsers,
  IconLink,
  IconVideo,
} from '@tabler/icons-react';
import { fetchRecipe } from '../../services/api';
import { MarkdownContent } from '../../components/MarkdownContent';
import { RecipeFeedback } from '../../components/recipes/RecipeFeedback';
import { getPhotoSrc } from '../../utils/photo';

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: recipe,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => fetchRecipe(Number(id)),
    enabled: !!id,
  });

  const groupedIngredients = useMemo(() => {
    if (!recipe?.ingredients) return {};
    const groups: Record<string, typeof recipe.ingredients> = {};
    
    recipe.ingredients.forEach(ing => {
      const g = ing.groupName || 'Ingredients';
      if (!groups[g]) groups[g] = [];
      groups[g].push(ing);
    });
    
    return groups;
  }, [recipe]);

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
        <Button
          leftSection={<IconArrowLeft size={18} />}
          variant="subtle"
          onClick={() => navigate('/recipes')}
          mt="md"
        >
          Back to Cookbook
        </Button>
      </Container>
    );
  }

  return (
    <Container size="lg">
      <Stack gap="xl">
        <Group justify="space-between" wrap="nowrap" align="center">
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
              {recipe.labels && recipe.labels.length > 0 && (
                <Group gap={5} mt="xs">
                  {recipe.labels.map((label) => (
                    <Badge key={label} variant="outline" color="indigo">
                      {label}
                    </Badge>
                  ))}
                </Group>
              )}
              <Group gap="sm" mt="sm">
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

            {recipe.photos && recipe.photos.length > 0 && (
              <>
                <div>
                  <Title order={3} mb="md">
                    Photos
                  </Title>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    {recipe.photos.map((photo, index) => (
                      <Paper key={index} withBorder radius="md" style={{ overflow: 'hidden' }}>
                        <Image
                          src={getPhotoSrc(photo.photoUrl)}
                          alt={`Recipe photo ${index + 1}`}
                          fit="contain"
                        />
                      </Paper>
                    ))}
                  </SimpleGrid>
                </div>
                <Divider />
              </>
            )}

            <div>
              <Title order={3} mb="md">
                Description
              </Title>
              {recipe.description ? (
                <MarkdownContent content={recipe.description} />
              ) : (
                <Text c="dimmed" fs="italic">
                  No description provided.
                </Text>
              )}
            </div>

            <Divider />

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              <Stack gap="md">
                <Title order={3}>Ingredients</Title>
                <Stack gap="lg">
                  {Object.entries(groupedIngredients).map(([group, ingredients]) => (
                    <Box key={group}>
                      {group !== 'Ingredients' && (
                        <Text fw={700} size="sm" c="indigo" tt="uppercase" mb="xs" style={{ letterSpacing: '1px' }}>
                          {group}
                        </Text>
                      )}
                      <Table layout="fixed" verticalSpacing="sm">
                        <Table.Tbody>
                          {ingredients.map((ing, index) => (
                            <Table.Tr key={index}>
                              <Table.Td w={40}>
                                <Avatar 
                                  src={getPhotoSrc(ing.itemPhoto)} 
                                  size="sm" 
                                  radius="xs"
                                  variant="light"
                                >
                                  <IconChefHat size={14} />
                                </Avatar>
                              </Table.Td>
                              <Table.Td>
                                <Text fw={500}>{ing.itemName}</Text>
                              </Table.Td>
                              <Table.Td w={120} style={{ textAlign: 'right' }}>
                                <Text fw={700}>
                                  {ing.quantity} {ing.unit}
                                </Text>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </Box>
                  ))}
                </Stack>
              </Stack>

              <Stack gap="md">
                <Title order={3}>Nutrition Totals</Title>
                {recipe.nutritionTotals && recipe.nutritionTotals.length > 0 ? (
                  <Table withTableBorder withColumnBorders>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Nutrient</Table.Th>
                        <Table.Th>Value</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {recipe.nutritionTotals.map((n, index) => (
                        <Table.Tr key={index}>
                          <Table.Td fw={500}>{n.nutrientName}</Table.Td>
                          <Table.Td>
                            {n.value.toFixed(1)} {n.unit}
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                ) : (
                  <Card withBorder padding="md" radius="md">
                    <Text size="sm" c="dimmed">
                      No nutrition data available for the selected ingredients.
                    </Text>
                  </Card>
                )}
              </Stack>
            </SimpleGrid>

            {recipe.steps && recipe.steps.length > 0 && (
              <>
                <Divider />
                <Stack gap="md">
                  <Title order={3}>Preparation Steps</Title>
                  <Stack gap="xs">
                    {recipe.steps.map((step, index) => (
                      <Paper key={index} withBorder p="md" radius="md">
                        <Group align="flex-start" wrap="nowrap">
                          <Avatar color="blue" radius="xl" size="sm">
                            {index + 1}
                          </Avatar>
                          <Stack gap={5} style={{ flex: 1 }}>
                            <MarkdownContent content={step.instruction} />
                            {step.timeMinutes && (
                              <Badge variant="dot" size="xs" color="gray">
                                {step.timeMinutes} mins
                              </Badge>
                            )}
                          </Stack>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </Stack>
              </>
            )}

            <RecipeFeedback
              recipeId={recipe.id}
              averageRating={recipe.averageRating || 0}
              totalRatings={recipe.ratings?.length || 0}
              allRatings={recipe.ratings || []}
            />
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
