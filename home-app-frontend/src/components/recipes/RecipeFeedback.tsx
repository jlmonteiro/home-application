import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Stack,
  Title,
  Text,
  Group,
  Rating,
  Button,
  Paper,
  Avatar,
  Divider,
  Box,
  Collapse,
  UnstyledButton,
  ActionIcon,
} from '@mantine/core';
import { IconMessagePlus, IconChevronDown, IconChevronUp, IconTrash } from '@tabler/icons-react';
import { fetchRecipeComments, fetchUserRecipeRating, addRecipeComment, deleteRecipeComment, rateRecipe } from '../../services/api';
import { notifications } from '@mantine/notifications';
import type { RecipeComment, RecipeRating } from '../../types';
import dayjs from 'dayjs';

import relativeTime from 'dayjs/plugin/relativeTime';
import { useAuth } from '../../context/AuthContext';
import { MarkdownContent } from '../MarkdownContent';
import { MarkdownEditor } from './MarkdownEditor';
import { getPhotoSrc } from '../../utils/photo';

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
  const [showEditor, setShowEditor] = useState(false);
  const { user: me } = useAuth();
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
      setShowEditor(false);
      queryClient.invalidateQueries({ queryKey: ['recipe-comments', recipeId] });
      notifications.show({ title: 'Success', message: 'Comment added', color: 'green' });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteRecipeComment(recipeId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe-comments', recipeId] });
      notifications.show({ title: 'Success', message: 'Comment deleted', color: 'green' });
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
            <Text size="sm" c="dimmed">({totalRatings} votes)</Text>
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
                      {r.createdAt && <Text size="xs" c="dimmed">{dayjs(r.createdAt).format('MMM D, YYYY')}</Text>}
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
        <Group justify="space-between" align="center">
          <Title order={3}>Comments</Title>
          {!showEditor && (
            <Button 
              variant="light" 
              leftSection={<IconMessagePlus size={16} />} 
              onClick={() => setShowEditor(true)}
            >
              Add Comment
            </Button>
          )}
        </Group>
        
        {showEditor && (
          <Paper withBorder p="md" radius="md">
            <Stack gap="sm">
              <MarkdownEditor
                value={comment}
                onChange={setComment}
                placeholder="What do you think about this recipe? Supports Markdown..."
                minHeight={150}
              />
              <Group justify="flex-end">
                <Button variant="subtle" onClick={() => { setShowEditor(false); setComment(''); }}>
                  Cancel
                </Button>
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
        )}

        <Stack gap="sm" mt="md">
          {commentsLoading ? (
            <Text size="sm" c="dimmed">Loading comments...</Text>
          ) : !comments || comments.length === 0 ? (
            <Text size="sm" c="dimmed" fs="italic">No comments yet. Be the first to share your feedback!</Text>
          ) : (
            comments.map((c: RecipeComment) => (
              <Paper key={c.id} withBorder p="sm" radius="md">
                <Group align="flex-start" wrap="nowrap">
                  <Avatar src={getPhotoSrc(c.userPhoto)} radius="xl" size="md">
                    {c.userName.charAt(0)}
                  </Avatar>
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Group justify="space-between">
                      <Group gap="xs">
                        <Text size="sm" fw={700}>{c.userName}</Text>
                        <Text size="xs" c="dimmed">{dayjs(c.createdAt).fromNow()}</Text>
                      </Group>
                      {me?.id === c.userId && (
                        <ActionIcon 
                          variant="subtle" 
                          color="red" 
                          size="sm"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this comment?')) {
                              deleteCommentMutation.mutate(c.id!);
                            }
                          }}
                          loading={deleteCommentMutation.isPending}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      )}
                    </Group>
                    <Box style={{ fontSize: '14px' }}>
                      <MarkdownContent content={c.comment} />
                    </Box>
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
