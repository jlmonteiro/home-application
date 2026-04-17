import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Stack,
  Title,
  Text,
  Group,
  Rating,
  Textarea,
  Button,
  Paper,
  Avatar,
  Divider,
  Box,
  Collapse,
  UnstyledButton,
} from '@mantine/core';
import { IconMessagePlus, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { fetchRecipeComments, fetchUserRecipeRating, addRecipeComment, rateRecipe } from '../../services/api';
import { notifications } from '@mantine/notifications';
import type { RecipeComment, RecipeRating } from '../../types/recipes';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface RecipeFeedbackProps {
  recipeId: number;
  averageRating: number;
  totalRatings: number;
  allRatings: RecipeRating[];
}

export function RecipeFeedback({ recipeId, averageRating, totalRatings, allRatings }: RecipeFeedbackProps) {
  const [comment, setComment] = useState('');
  const [showAllRatings, setShowAllRatings] = useState(false);
  const queryClient = useQueryClient();

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['recipe-comments', recipeId],
    queryFn: () => fetchRecipeComments(recipeId),
  });

  const { data: userRating } = useQuery({
    queryKey: ['recipe-user-rating', recipeId],
    queryFn: () => fetchUserRecipeRating(recipeId),
  });

  const commentMutation = useMutation({
    mutationFn: (newComment: string) => addRecipeComment(recipeId, newComment),
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['recipe-comments', recipeId] });
      notifications.show({ title: 'Success', message: 'Comment added', color: 'green' });
    },
  });

  const ratingMutation = useMutation({
    mutationFn: (rating: number) => rateRecipe(recipeId, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe-user-rating', recipeId] });
      queryClient.invalidateQueries({ queryKey: ['recipe', recipeId.toString()] });
      notifications.show({ title: 'Success', message: 'Rating saved', color: 'green' });
    },
  });

  return (
    <Stack gap="xl" mt="xl">
      <Divider label="Feedback & Ratings" labelPosition="center" />
      
      <Group justify="space-between" align="flex-start">
        <Stack gap={5}>
          <Title order={3}>Ratings</Title>
          <Group gap="xs">
            <Rating value={averageRating || 0} readOnly fractions={2} size="lg" />
            <Text size="lg" fw={700}>{(averageRating || 0).toFixed(1)}</Text>
            <Text size="sm" c="dimmed">({totalRatings || 0} votes)</Text>
          </Group>
          
          {allRatings && allRatings.length > 0 && (
            <Box mt="xs">
              <UnstyledButton onClick={() => setShowAllRatings(!showAllRatings)}>
                <Group gap={4}>
                  <Text size="xs" c="blue" fw={500}>
                    {showAllRatings ? 'Hide individual votes' : 'Show individual votes'}
                  </Text>
                  {showAllRatings ? <IconChevronUp size={14} color="var(--mantine-color-blue-6)" /> : <IconChevronDown size={14} color="var(--mantine-color-blue-6)" />}
                </Group>
              </UnstyledButton>
              
              <Collapse expanded={showAllRatings}>
                <Stack gap={5} mt="xs">
                  {allRatings.map((r, i) => (
                    <Group key={i} gap="xs">
                      <Text size="xs" fw={500}>{r.userName}:</Text>
                      <Rating value={r.rating} readOnly size="xs" />
                      <Text size="xs" c="dimmed">{dayjs(r.createdAt).format('MMM D, YYYY')}</Text>
                    </Group>
                  ))}
                </Stack>
              </Collapse>
            </Box>
          )}
        </Stack>

        <Paper withBorder p="md" radius="md" style={{ width: '300px' }}>
          <Stack gap="xs">
            <Text size="sm" fw={500}>Your Rating</Text>
            <Rating 
              value={userRating?.rating || 0} 
              onChange={(val) => ratingMutation.mutate(val)} 
              size="md" 
            />
            <Text size="xs" c="dimmed">Click stars to rate this recipe.</Text>
          </Stack>
        </Paper>
      </Group>

      <Stack gap="md">
        <Title order={3}>Comments</Title>
        
        <Paper withBorder p="md" radius="md">
          <Stack gap="sm">
            <Textarea
              placeholder="What do you think about this recipe?"
              minRows={2}
              value={comment}
              onChange={(e) => setComment(e.currentTarget.value)}
            />
            <Group justify="flex-end">
              <Button 
                variant="light" 
                leftSection={<IconMessagePlus size={18} />}
                disabled={!comment.trim()}
                loading={commentMutation.isPending}
                onClick={() => commentMutation.mutate(comment)}
              >
                Post Comment
              </Button>
            </Group>
          </Stack>
        </Paper>

        <Stack gap="sm" mt="md">
          {commentsLoading ? (
            <Text size="sm" c="dimmed">Loading comments...</Text>
          ) : comments?.length === 0 ? (
            <Text size="sm" c="dimmed" fs="italic">No comments yet. Be the first to share your feedback!</Text>
          ) : (
            comments?.map((c: RecipeComment) => (
              <Paper key={c.id} withBorder p="sm" radius="md">
                <Group align="flex-start" wrap="nowrap">
                  <Avatar src={c.userPhoto} radius="xl" size="sm" />
                  <Stack gap={2} style={{ flex: 1 }}>
                    <Group justify="space-between">
                      <Text size="sm" fw={700}>{c.userName}</Text>
                      <Text size="xs" c="dimmed">{dayjs(c.createdAt).fromNow()}</Text>
                    </Group>
                    <Text size="sm">{c.comment}</Text>
                  </Stack>
                </Group>
              </Paper>
            ))
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}
