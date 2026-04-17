import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Title,
  Text,
  Stack,
  Loader,
  Center,
  Paper,
  Group,
  ActionIcon,
  Badge,
  Box,
} from '@mantine/core';
import { IconMailOpened, IconCalendarWeek, IconChefHat, IconMessage, IconBell } from '@tabler/icons-react';
import { fetchNotifications, markNotificationAsRead } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const TYPE_ICONS: Record<string, React.ReactNode> = {
  MEAL_PLAN_PUBLISHED: <IconCalendarWeek size={20} color="var(--mantine-color-blue-6)" />,
  MEAL_REMINDER: <IconCalendarWeek size={20} color="var(--mantine-color-orange-6)" />,
  NEW_RECIPE_COMMENT: <IconChefHat size={20} color="var(--mantine-color-indigo-6)" />,
  NEW_MESSAGE: <IconMessage size={20} color="var(--mantine-color-green-6)" />,
};

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications-list-full'],
    queryFn: fetchNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-list-full'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const handleNotificationClick = (id: number, link?: string) => {
    markReadMutation.mutate(id);
    if (link) navigate(link);
  };

  if (isLoading) return <Center h="50vh"><Loader /></Center>;

  return (
    <Container size="md">
      <Stack gap="xl">
        <Group justify="space-between">
          <div>
            <Title order={1}>Notifications</Title>
            <Text c="dimmed">Stay updated with your household activities.</Text>
          </div>
        </Group>

        <Stack gap="md">
          {notifications?.length === 0 ? (
            <Paper withBorder p="xl" radius="md">
              <Stack align="center" gap="sm">
                <IconBell size={48} stroke={1.5} color="var(--mantine-color-gray-4)" />
                <Text c="dimmed">You have no notifications yet.</Text>
              </Stack>
            </Paper>
          ) : (
            notifications?.map((n) => (
              <Paper
                key={n.id}
                withBorder
                p="md"
                radius="md"
                onClick={() => handleNotificationClick(n.id, n.link)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: n.isRead ? 'transparent' : 'var(--mantine-color-blue-0)',
                  transition: 'transform 100ms ease',
                  '&:hover': { transform: 'scale(1.01)' }
                }}
              >
                <Group wrap="nowrap" align="flex-start" gap="md">
                  <Box mt={4}>{TYPE_ICONS[n.type] || <IconBell size={20} />}</Box>
                  <Stack gap={2} style={{ flex: 1 }}>
                    <Group justify="space-between" align="center">
                      <Text fw={n.isRead ? 600 : 800} size="md">{n.title}</Text>
                      {!n.isRead && <Badge size="xs" color="blue">New</Badge>}
                    </Group>
                    <Text size="sm">{n.message}</Text>
                    <Text size="xs" c="dimmed">{dayjs(n.createdAt).format('MMM D, YYYY [at] h:mm A')} ({dayjs(n.createdAt).fromNow()})</Text>
                  </Stack>
                  {!n.isRead && (
                    <ActionIcon 
                      variant="subtle" 
                      color="gray" 
                      onClick={(e) => {
                        e.stopPropagation();
                        markReadMutation.mutate(n.id);
                      }}
                    >
                      <IconMailOpened size={18} />
                    </ActionIcon>
                  )}
                </Group>
              </Paper>
            ))
          )}
        </Stack>
      </Stack>
    </Container>
  );
}
