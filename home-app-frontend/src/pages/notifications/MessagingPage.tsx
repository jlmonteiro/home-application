import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Stack,
  Loader,
  Center,
  Paper,
  Group,
  Avatar,
  TextInput,
  ActionIcon,
  ScrollArea,
  Box,
} from '@mantine/core';
import { IconSend, IconArrowLeft } from '@tabler/icons-react';
import { fetchConversation, sendMessage, fetchAllUsers } from '../../services/api';
import { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';

export function MessagingPage() {
  const { recipientId } = useParams<{ recipientId: string }>();
  const { user: me } = useAuth();
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();
  const viewport = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: conversation, isLoading } = useQuery({
    queryKey: ['conversation', recipientId],
    queryFn: () => fetchConversation(Number(recipientId)),
    enabled: !!recipientId,
    refetchInterval: 10000, // Poll every 10s
  });

  const { data: users } = useQuery({
    queryKey: ['users-all'],
    queryFn: fetchAllUsers,
  });

  const targetUser = users?.find(u => u.id === Number(recipientId));

  const sendMutation = useMutation({
    mutationFn: (content: string) => sendMessage(Number(recipientId), content),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['conversation', recipientId] });
    },
  });

  const scrollToBottom = () => {
    viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  if (isLoading) return <Center h="50vh"><Loader /></Center>;

  return (
    <Container size="sm">
      <Stack h="calc(100vh - 150px)" gap="md">
        <Group>
          <ActionIcon variant="subtle" onClick={() => navigate(-1)}>
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Avatar src={targetUser?.photo} radius="xl" size="sm" />
          <Title order={3}>{targetUser?.firstName} {targetUser?.lastName}</Title>
        </Group>

        <Paper withBorder p="md" radius="md" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ScrollArea viewportRef={viewport} style={{ flex: 1 }} p="md">
            <Stack gap="sm">
              {conversation?.length === 0 ? (
                <Text size="sm" c="dimmed" style={{ textAlign: 'center' }} mt="xl">
                  No messages yet. Send a greeting!
                </Text>
              ) : (
                conversation?.map((m) => (
                  <Box
                    key={m.id}
                    style={{
                      alignSelf: m.senderId === me?.id ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                    }}
                  >
                    <Paper
                      withBorder
                      p="xs"
                      radius="md"
                      bg={m.senderId === me?.id ? 'blue.0' : 'gray.0'}
                    >
                      <Text size="sm">{m.content}</Text>
                      <Text size="10px" c="dimmed" style={{ textAlign: 'right' }}>
                        {dayjs(m.createdAt).format('h:mm A')}
                      </Text>
                    </Paper>
                  </Box>
                ))
              )}
            </Stack>
          </ScrollArea>

          <Box mt="md">
            <Group gap="xs">
              <TextInput
                placeholder="Type a message..."
                style={{ flex: 1 }}
                value={message}
                onChange={(e) => setMessage(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && message.trim()) {
                    sendMutation.mutate(message);
                  }
                }}
              />
              <ActionIcon 
                size="lg" 
                variant="filled" 
                color="blue" 
                onClick={() => message.trim() && sendMutation.mutate(message)}
                loading={sendMutation.isPending}
              >
                <IconSend size={18} />
              </ActionIcon>
            </Group>
          </Box>
        </Paper>
      </Stack>
    </Container>
  );
}
