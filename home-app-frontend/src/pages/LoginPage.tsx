import { Button, Center, Container, Paper, Stack, Text, Title } from '@mantine/core'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { user } = useAuth()

  // If user is already logged in, go to home
  if (user) {
    return <Navigate to="/" replace />
  }

  const handleLogin = () => {
    // Redirect to backend OAuth2 endpoint
    window.location.href = '/oauth2/authorization/google'
  }

  return (
    <Container size="xs" h="100vh">
      <Center h="100%">
        <Paper withBorder shadow="md" p={30} radius="md" w="100%">
          <Stack align="center" gap="lg">
            <Title order={2} ta="center">
              Home App
            </Title>
            <Text c="dimmed" size="sm" ta="center">
              Welcome back! Please login to continue.
            </Text>

            <Button
              fullWidth
              variant="default"
              size="lg"
              onClick={handleLogin}
              leftSection={
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  width={18}
                  height={18}
                  alt="Google"
                />
              }
            >
              Login with Google
            </Button>
          </Stack>
        </Paper>
      </Center>
    </Container>
  )
}
