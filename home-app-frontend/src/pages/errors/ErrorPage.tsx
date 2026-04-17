import { Title, Text, Button, Container, Group, Stack, Center } from '@mantine/core'
import { IconArrowLeft, IconAlertTriangle, IconQuestionMark } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'

interface ErrorPageProps {
  type: '404' | '502'
}

export function ErrorPage({ type }: ErrorPageProps) {
  const navigate = useNavigate()

  const is404 = type === '404'

  return (
    <Container h="100vh">
      <Center h="100%">
        <Stack align="center" gap="xl">
          <Center
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '100%',
              backgroundColor: is404 ? 'var(--mantine-color-gray-1)' : 'var(--mantine-color-red-0)',
            }}
          >
            {is404 ? (
              <IconQuestionMark size={60} color="var(--mantine-color-gray-6)" stroke={1.5} />
            ) : (
              <IconAlertTriangle size={60} color="var(--mantine-color-red-6)" stroke={1.5} />
            )}
          </Center>

          <Stack gap={0} align="center">
            <Title
              style={{
                fontSize: '38px',
                fontWeight: 900,
                textAlign: 'center',
              }}
            >
              {is404 ? 'Page Not Found' : 'Backend Unavailable'}
            </Title>
            <Text
              c="dimmed"
              size="lg"
              ta="center"
              style={{ maxWidth: '500px', marginTop: 'var(--mantine-spacing-md)' }}
            >
              {is404
                ? "The page you are looking for does not exist or has been moved. If you think this is an error, please contact the administrator."
                : 'We are having trouble connecting to our servers. This usually happens when the backend service is starting up or temporarily offline.'}
            </Text>
          </Stack>

          <Group justify="center">
            {is404 ? (
              <Button
                variant="subtle"
                size="md"
                leftSection={<IconArrowLeft size={18} />}
                onClick={() => navigate('/')}
              >
                Back to Home Page
              </Button>
            ) : (
              <Button
                variant="light"
                color="red"
                size="md"
                onClick={() => window.location.reload()}
              >
                Retry Connection
              </Button>
            )}
          </Group>
        </Stack>
      </Center>
    </Container>
  )
}
