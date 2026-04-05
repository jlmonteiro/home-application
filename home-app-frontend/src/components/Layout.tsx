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
  Box,
} from '@mantine/core'
import { Outlet } from 'react-router-dom'
import { IconLogout, IconChevronDown, IconSun, IconMoon, IconSettings, IconUser } from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext'

export function Layout() {
  const { user, logout } = useAuth()
  const { setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })

  const photoSrc = user?.photo?.startsWith('data:image')
    ? user.photo
    : `data:image/png;base64,${user?.photo}`

  return (
    <AppShell 
      header={{ height: 70 }} 
      padding="md"
    >
      <AppShell.Header 
        withBorder={false}
        style={{
          backgroundColor: 'light-dark(rgba(255, 255, 255, 0.8), rgba(26, 27, 30, 0.8))',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid light-dark(#e9ecef, #2c2e33)',
        }}
      >
        <Container size="xl" h="100%">
          <Group justify="space-between" h="100%">
            <Group gap="xs">
              <Box 
                w={34} 
                h={34} 
                bg="indigo" 
                style={{ borderRadius: rem(8), display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text color="white" fw={900} size="xl" style={{ lineHeight: 1 }}>H</Text>
              </Box>
              <Text size="lg" fw={800} style={{ letterSpacing: rem(-0.5) }}>
                HOME APP
              </Text>
            </Group>

            <Group gap="lg">
              <ActionIcon
                onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
                variant="subtle"
                color="gray"
                size="lg"
                radius="md"
                aria-label="Toggle color scheme"
              >
                {computedColorScheme === 'light' ? (
                  <IconMoon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
                ) : (
                  <IconSun style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
                )}
              </ActionIcon>

              <Menu 
                width={220} 
                position="bottom-end" 
                transitionProps={{ transition: 'pop-top-right' }}
                radius="md"
                shadow="xl"
              >
                <Menu.Target>
                  <UnstyledButton 
                    style={(theme) => ({
                      padding: `${rem(4)} ${rem(8)}`,
                      borderRadius: theme.radius.md,
                      transition: 'background-color 100ms ease',
                      '&:hover': {
                        backgroundColor: 'light-dark(#f8f9fa, #2c2e33)',
                      },
                    })}
                  >
                    <Group gap={8}>
                      <Avatar
                        src={user?.photo ? photoSrc : null}
                        alt={user?.firstName}
                        radius="xl"
                        size={32}
                        color="indigo"
                      >
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </Avatar>
                      <Box visibleFrom="sm">
                        <Text size="sm" fw={600} lh={1}>
                          {user?.firstName} {user?.lastName}
                        </Text>
                      </Box>
                      <IconChevronDown style={{ width: rem(14), height: rem(14) }} stroke={1.5} />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown p={4}>
                  <Menu.Label>Application</Menu.Label>
                  <Menu.Item leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} stroke={1.5} />}>
                    Profile
                  </Menu.Item>
                  <Menu.Item leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} stroke={1.5} />}>
                    Settings
                  </Menu.Item>
                  
                  <Menu.Divider />
                  
                  <Menu.Label>Danger zone</Menu.Label>
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

      <AppShell.Main pt={rem(70 + 24)}>
        <Container size="xl">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
