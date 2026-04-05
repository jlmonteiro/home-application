import { Title, Text, Paper, Stack } from '@mantine/core'
import { useAuth } from '../context/AuthContext'

export function Dashboard() {
  const { user } = useAuth()

  return (
    <Stack>
      <Title order={1}>Welcome back, {user?.firstName}!</Title>
      <Paper withBorder p="md" radius="md">
        <Text>
          This is your dashboard. From here, you will be able to manage your household activities,
          profiles, and more.
        </Text>
      </Paper>
    </Stack>
  )
}
