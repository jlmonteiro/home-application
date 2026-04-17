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
  Burger,
  NavLink,
  Stack,
  Divider,
  Breadcrumbs,
  Anchor,
  Paper,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  IconLogout,
  IconChevronDown,
  IconSun,
  IconMoon,
  IconSettings,
  IconUser,
  IconPhone,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconShoppingCart,
  IconLayoutDashboard,
  IconChevronRight,
  IconList,
  IconBuildingStore,
  IconCategory,
  IconPackages,
  IconUserCircle,
  IconAdjustments,
  IconChefHat,
} from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext'

export function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [opened, { toggle }] = useDisclosure(true)
  const [shoppingOpened, { toggle: toggleShopping }] = useDisclosure(false)
  const [recipesOpened, { toggle: toggleRecipes }] = useDisclosure(true)
  const { setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })

  const photoSrc = user?.photo?.startsWith('http')
    ? user.photo
    : user?.photo?.startsWith('data:image')
      ? user.photo
      : `data:image/png;base64,${user?.photo}`

  const isAdult = user?.ageGroupName === 'Adult'

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  // Breadcrumb logic
  const getBreadcrumbs = () => {
    const path = location.pathname
    const crumbs: { title: string; href: string; icon?: React.ReactNode }[] = [
      { title: 'Home', href: '/', icon: <IconLayoutDashboard size={16} /> },
    ]

    if (path.startsWith('/shopping/')) {
      crumbs.push({
        title: 'Shopping',
        href: '/shopping/lists',
        icon: <IconShoppingCart size={16} />,
      })

      if (path.includes('/stores')) {
        crumbs.push({
          title: 'Stores',
          href: '/shopping/stores',
          icon: <IconBuildingStore size={16} />,
        })
        if (path.match(/\/stores\/\d+$/)) {
          crumbs.push({ title: 'Store Details', href: path })
        }
      } else if (path.includes('/lists')) {
        crumbs.push({ title: 'Lists', href: '/shopping/lists', icon: <IconList size={16} /> })
        if (path.match(/\/lists\/\d+$/)) {
          crumbs.push({ title: 'List Details', href: path })
        }
      } else if (path.includes('/categories')) {
        crumbs.push({
          title: 'Categories',
          href: '/shopping/categories',
          icon: <IconCategory size={16} />,
        })
      } else if (path.includes('/items')) {
        crumbs.push({ title: 'Items', href: '/shopping/items', icon: <IconPackages size={16} /> })
      }
    } else if (path.startsWith('/recipes')) {
      crumbs.push({
        title: 'Recipes & Meals',
        href: '/recipes',
        icon: <IconChefHat size={16} />,
      })

      if (path === '/recipes') {
        crumbs[crumbs.length - 1].title = 'Recipes'
      } else if (path === '/recipes/new') {
        crumbs.push({ title: 'New Recipe', href: path })
      } else if (path.match(/\/recipes\/\d+$/)) {
        crumbs.push({ title: 'Recipe Details', href: path })
      } else if (path.match(/\/recipes\/\d+\/edit$/)) {
        const recipeId = path.split('/')[2]
        crumbs.push({ title: 'Recipe Details', href: `/recipes/${recipeId}` })
        crumbs.push({ title: 'Edit Recipe', href: path })
      }
    } else if (path === '/profile') {
      crumbs.push({ title: 'Profile', href: '/profile', icon: <IconUserCircle size={16} /> })
    } else if (path === '/preferences') {
      crumbs.push({
        title: 'Preferences',
        href: '/preferences',
        icon: <IconAdjustments size={16} />,
      })
    } else if (path === '/settings') {
      crumbs.push({ title: 'Settings', href: '/settings', icon: <IconSettings size={16} /> })
    }

    return crumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 260,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: !opened },
      }}
      padding="md"
      transitionDuration={300}
      transitionTimingFunction="ease"
    >
      <AppShell.Header
        withBorder={false}
        style={{
          backgroundColor:
            computedColorScheme === 'dark' ? 'rgba(26, 27, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${computedColorScheme === 'dark' ? '#2c2e33' : '#e9ecef'}`,
          zIndex: 1000,
        }}
      >
        <Container size="xl" h="100%" fluid>
          <Group justify="space-between" h="100%">
            <Group gap="xs">
              <Burger opened={opened} onClick={toggle} size="sm" mr="sm" />
              <Box
                w={34}
                h={34}
                bg="indigo"
                component={Link}
                to="/"
                style={{
                  borderRadius: rem(8),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                }}
              >
                <Text c="white" fw={900} size="xl" style={{ lineHeight: 1 }}>
                  H
                </Text>
              </Box>
              <Text
                size="lg"
                fw={800}
                style={{ letterSpacing: rem(-0.5), textDecoration: 'none' }}
                component={Link}
                to="/"
                c="var(--mantine-color-text)"
              >
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
                width={240}
                position="bottom-end"
                transitionProps={{ transition: 'pop-top-right' }}
                radius="md"
                shadow="xl"
              >
                <Menu.Target>
                  <UnstyledButton
                    style={{
                      padding: `${rem(4)} ${rem(8)}`,
                      borderRadius: rem(8),
                      transition: 'background-color 100ms ease',
                      '&:hover': {
                        backgroundColor: computedColorScheme === 'dark' ? '#2c2e33' : '#f8f9fa',
                      },
                    }}
                  >
                    <Group gap={8}>
                      <Avatar
                        src={user?.photo ? photoSrc : null}
                        alt={user?.firstName}
                        radius="xl"
                        size={32}
                        color="indigo"
                      >
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                      </Avatar>
                      <Box visibleFrom="sm">
                        <Stack gap={0}>
                          <Text size="sm" fw={600} lh={1}>
                            {user?.firstName} {user?.lastName}
                          </Text>
                          {user?.familyRoleName && (
                            <Text size="xs" c="dimmed" lh={1.2}>
                              {user.familyRoleName}
                            </Text>
                          )}
                        </Stack>
                      </Box>
                      <IconChevronDown style={{ width: rem(14), height: rem(14) }} stroke={1.5} />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown p={4}>
                  <Menu.Label>User Account</Menu.Label>
                  <Menu.Item
                    component={Link}
                    to="/profile"
                    leftSection={
                      <IconUser style={{ width: rem(14), height: rem(14) }} stroke={1.5} />
                    }
                  >
                    View/Edit Profile
                  </Menu.Item>

                  <Menu.Item
                    component={Link}
                    to="/preferences"
                    leftSection={
                      <IconSettings style={{ width: rem(14), height: rem(14) }} stroke={1.5} />
                    }
                  >
                    Preferences
                  </Menu.Item>

                  {user?.mobilePhone && (
                    <>
                      <Menu.Divider />
                      <Menu.Label>Contact Info</Menu.Label>
                      <Menu.Item
                        leftSection={
                          <IconPhone style={{ width: rem(14), height: rem(14) }} stroke={1.5} />
                        }
                      >
                        {user.mobilePhone}
                      </Menu.Item>
                    </>
                  )}

                  {(user?.facebook || user?.instagram || user?.linkedin) && (
                    <>
                      <Menu.Divider />
                      <Menu.Label>Social Profiles</Menu.Label>
                      <Group gap={4} px="sm" py="xs">
                        {user?.facebook && (
                          <ActionIcon
                            component="a"
                            href={user.facebook}
                            target="_blank"
                            variant="subtle"
                            color="blue"
                            radius="md"
                          >
                            <IconBrandFacebook size={18} stroke={1.5} />
                          </ActionIcon>
                        )}
                        {user?.instagram && (
                          <ActionIcon
                            component="a"
                            href={user.instagram}
                            target="_blank"
                            variant="subtle"
                            color="pink"
                            radius="md"
                          >
                            <IconBrandInstagram size={18} stroke={1.5} />
                          </ActionIcon>
                        )}
                        {user?.linkedin && (
                          <ActionIcon
                            component="a"
                            href={user.linkedin}
                            target="_blank"
                            variant="subtle"
                            color="blue"
                            radius="md"
                          >
                            <IconBrandLinkedin size={18} stroke={1.5} />
                          </ActionIcon>
                        )}
                      </Group>
                    </>
                  )}

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

      <AppShell.Navbar
        p="md"
        style={{
          borderRight: `1px solid ${computedColorScheme === 'dark' ? '#2c2e33' : '#e9ecef'}`,
        }}
      >
        <Stack gap="xs">
          <Text
            size="xs"
            fw={700}
            c="dimmed"
            tt="uppercase"
            pl="xs"
            mb={4}
            style={{ whiteSpace: 'nowrap' }}
          >
            Main Menu
          </Text>

          <NavLink
            component={Link}
            to="/"
            label="Dashboard"
            leftSection={<IconLayoutDashboard size={20} stroke={1.5} />}
            active={isActive('/')}
            variant="filled"
            color="indigo"
          />

          <NavLink
            label="Shopping"
            leftSection={<IconShoppingCart size={20} stroke={1.5} />}
            childrenOffset={28}
            opened={shoppingOpened}
            onChange={toggleShopping}
          >
            <NavLink
              component={Link}
              to="/shopping/lists"
              label="Lists"
              active={isActive('/shopping/lists')}
            />
            <NavLink
              component={Link}
              to="/shopping/stores"
              label="Stores"
              active={isActive('/shopping/stores')}
            />
            <NavLink
              component={Link}
              to="/shopping/categories"
              label="Categories"
              active={isActive('/shopping/categories')}
            />
            <NavLink
              component={Link}
              to="/shopping/items"
              label="Items"
              active={isActive('/shopping/items')}
            />
          </NavLink>

          <NavLink
            label="Recipes & Meals"
            leftSection={<IconChefHat size={20} stroke={1.5} />}
            childrenOffset={28}
            opened={recipesOpened}
            onChange={toggleRecipes}
          >
            <NavLink
              component={Link}
              to="/recipes"
              label="Recipes"
              active={isActive('/recipes')}
            />
          </NavLink>

          {isAdult && (
            <>
              <Divider my="sm" />
              <Text
                size="xs"
                fw={700}
                c="dimmed"
                tt="uppercase"
                pl="xs"
                mb={4}
                style={{ whiteSpace: 'nowrap' }}
              >
                Administration
              </Text>
              <NavLink
                component={Link}
                to="/settings"
                label="Household Settings"
                leftSection={<IconSettings size={20} stroke={1.5} />}
                active={isActive('/settings')}
                variant="filled"
                color="indigo"
              />
            </>
          )}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main pt={rem(70 + 24)}>
        <Container size="xl">
          {location.pathname !== '/' && (
            <Paper
              p="sm"
              radius="md"
              mb="lg"
              bg={computedColorScheme === 'dark' ? 'dark.5' : 'gray.0'}
              style={{
                border: `1px solid ${computedColorScheme === 'dark' ? '#2c2e33' : '#e9ecef'}`,
              }}
            >
              <Breadcrumbs
                separator={<IconChevronRight size={14} style={{ opacity: 0.4 }} />}
                separatorMargin={8}
              >
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1
                  return (
                    <Anchor
                      key={crumb.href}
                      component={Link}
                      to={crumb.href}
                      c={isLast ? 'dimmed' : computedColorScheme === 'dark' ? 'gray.3' : 'dark'}
                      fw={isLast ? 600 : 500}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        textDecoration: 'none',
                      }}
                    >
                      {crumb.icon}
                      {crumb.title}
                    </Anchor>
                  )
                })}
              </Breadcrumbs>
            </Paper>
          )}
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
