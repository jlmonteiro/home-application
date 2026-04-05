import {
  AppShell,
  Avatar,
  Group,
  Text,
  UnstyledButton,
  Menu,
  rem,
  Container,
  ActionIcon,
  useMantineColorScheme,
  useComputedColorScheme,
} from '@mantine/core'
import { Outlet } from 'react-router-dom'
import { IconLogout, IconChevronDown, IconSun, IconMoon } from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext'

export function Layout() {
  const { user, logout } = useAuth()
  const { setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })

  // Base64 image needs prefix if not present
  const photoSrc = user?.photo?.startsWith('data:image')
    ? user.photo
    : `data:image/png;base64,${user?.photo}`

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Container size="xl" h="100%">
          <Group justify="space-between" h="100%">
            <Text size="xl" fw={700}>
              Home App
            </Text>

            <Group>
              <ActionIcon
                onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
                variant="default"
                size="lg"
                aria-label="Toggle color scheme"
              >
                {computedColorScheme === 'light' ? (
                  <IconMoon style={{ width: rem(22), height: rem(22) }} stroke={1.5} />
                ) : (
                  <IconSun style={{ width: rem(22), height: rem(22) }} stroke={1.5} />
                )}
              </ActionIcon>

              <Menu width={200} position="bottom-end" transitionProps={{ transition: 'pop-top-right' }}>
                <Menu.Target>
                  <UnstyledButton>
                    <Group gap={7}>
                      <Avatar
                        src={user?.photo ? photoSrc : null}
                        alt={user?.firstName}
                        radius="xl"
                        size={30}
                      />
                      <div style={{ flex: 1 }}>
                        <Text size="sm" fw={500}>
                          {user?.firstName} {user?.lastName}
                        </Text>
                        <Text c="dimmed" size="xs">
                          {user?.email}
                        </Text>
                      </div>
                      <IconChevronDown style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Settings</Menu.Label>
                  <Menu.Item
                    color="red"
                    leftSection={
                      <IconLogout style={{ width: rem(14), height: rem(14) }} stroke={1.5} />
                    }
                    onClick={() => logout()}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="xl">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
