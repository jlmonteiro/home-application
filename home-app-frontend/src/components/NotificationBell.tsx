import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ActionIcon,
  Indicator,
  Menu,
  Text,
  Stack,
  Group,
  Box,
  ScrollArea,
  Divider,
  Center,
  Loader,
} from '@mantine/core';
import { IconBell, IconMailOpened, IconCalendarWeek, IconChefHat, IconMessage } from '@tabler/icons-react';
import { fetchNotifications, fetchUnreadCount, markNotificationAsRead } from '../services/api';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const TYPE_ICONS: Record<string, React.ReactNode> = {
  MEAL_PLAN_PUBLISHED: <IconCalendarWeek size={16} color="var(--mantine-color-blue-6)" />,
  MEAL_REMINDER: <IconCalendarWeek size={16} color="var(--mantine-color-orange-6)" />,
  NEW_RECIPE_COMMENT: <IconChefHat size={16} color="var(--mantine-color-indigo-6)" />,
  NEW_MESSAGE: <IconMessage size={16} color="var(--mantine-color-green-6)" />,
};

export function NotificationBell() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: fetchUnreadCount,
    refetchInterval: 30000, // Poll every 30s
  });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications-list'],
    queryFn: fetchNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
    },
  });

  const handleNotificationClick = (id: number, link?: string) => {
    markReadMutation.mutate(id);
    if (link) navigate(link);
  };

  return (
    <Menu position="bottom-end" shadow="md" width={350}>
      <Menu.Target>
        <Indicator label={unreadCount > 0 ? unreadCount : undefined} disabled={unreadCount === 0} color="red" size={16}>
          <ActionIcon variant="subtle" color="gray" size="lg">
            <IconBell size={24} />
          </ActionIcon>
        </Indicator>
      </Menu.Target>

      <Menu.Dropdown p={0}>
        <Box p="xs">
          <Group justify="space-between">
            <Text fw={700} size="sm">Notifications</Text>
            {unreadCount > 0 && <Text size="xs" c="dimmed">{unreadCount} unread</Text>}
          </Group>
        </Box>
        <Divider />
        
        <ScrollArea.Autosize mah={400}>
          <Stack gap={0}>
            {isLoading ? (
              <Center p="xl"><Loader size="sm" /></Center>
            ) : notifications?.length === 0 ? (
              <Box p="xl" style={{ textAlign: 'center' }}>
                <Text size="sm" c="dimmed">No notifications yet.</Text>
              </Box>
            ) : (
              notifications?.map((n) => (
                <Menu.Item
                  key={n.id}
                  onClick={() => handleNotificationClick(n.id, n.link)}
                  style={{
                    backgroundColor: n.isRead ? 'transparent' : 'var(--mantine-color-blue-0)',
                  }}
                >
                  <Group wrap="nowrap" align="flex-start" gap="sm">
                    <Box mt={3}>{TYPE_ICONS[n.type] || <IconBell size={16} />}</Box>
                    <Stack gap={2} style={{ flex: 1 }}>
                      <Text size="sm" fw={n.isRead ? 500 : 700}>{n.title}</Text>
                      <Text size="xs" lineClamp={2}>{n.message}</Text>
                      <Text size="xs" c="dimmed">{dayjs(n.createdAt).fromNow()}</Text>
                    </Stack>
                    {!n.isRead && (
                      <Box mt={5}>
                        <IconMailOpened size={14} color="var(--mantine-color-gray-5)" onClick={(e) => {
                          e.stopPropagation();
                          markReadMutation.mutate(n.id);
                        }} />
                      </Box>
                    )}
                  </Group>
                </Menu.Item>
              ))
            )}
          </Stack>
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </Menu>
  );
}
