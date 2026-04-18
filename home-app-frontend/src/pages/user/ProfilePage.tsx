import {
  TextInput,
  Button,
  Avatar,
  Stack,
  Group,
  Title,
  Text,
  FileButton,
  Container,
  Paper,
  SimpleGrid,
  Select,
  Badge,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import {
  IconCamera,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconPhone,
  IconMail,
  IconUser,
  IconCheck,
  IconCake,
  IconUsers,
} from '@tabler/icons-react'
import { useAuth } from '../../context/AuthContext'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { updateUserProfile, fetchFamilyRoles, type ApiError } from '../../services/api'
import { notifications } from '@mantine/notifications'
import type { UserProfile } from '../../types/user'
import dayjs from 'dayjs'
import { getPhotoSrc } from '../../utils/photo'

const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/
const FACEBOOK_REGEX = /^https?:\/\/(www\.)?facebook\.com\/.*$/
const INSTAGRAM_REGEX = /^https?:\/\/(www\.)?instagram\.com\/.*$/
const LINKEDIN_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/.*$/

export function ProfilePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: roles } = useQuery({
    queryKey: ['family-roles'],
    queryKeyHashFn: () => 'family-roles',
    queryFn: fetchFamilyRoles,
  })

  const form = useForm<Partial<UserProfile>>({
    initialValues: {
      photo: user?.photo || {},
      facebook: user?.facebook || '',
      mobilePhone: user?.mobilePhone || '',
      instagram: user?.instagram || '',
      linkedin: user?.linkedin || '',
      birthdate: user?.birthdate || '',
      familyRoleId: user?.familyRoleId,
    },

    validate: {
      mobilePhone: (value) =>
        value && !PHONE_REGEX.test(value) ? 'Mobile phone must be a valid phone number' : null,
      facebook: (value) =>
        value && !FACEBOOK_REGEX.test(value) ? 'Facebook must be a valid Facebook URL' : null,
      instagram: (value) =>
        value && !INSTAGRAM_REGEX.test(value) ? 'Instagram must be a valid Instagram URL' : null,
      linkedin: (value) =>
        value && !LINKEDIN_REGEX.test(value) ? 'LinkedIn must be a valid LinkedIn URL' : null,
      birthdate: (value) => (!value ? 'Birthdate is required' : null),
      familyRoleId: (value) => (!value ? 'Family role is required' : null),
    },
  })

  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['user'], updatedProfile)
      notifications.show({
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully.',
        color: 'green',
        icon: <IconCheck size={18} />,
      })
    },
    onError: (error: ApiError) => {
      if (error.status === 400 && error.data?.errors) {
        form.setErrors(error.data.errors)
        notifications.show({
          title: 'Update Failed',
          message: 'Please check the errors in the form.',
          color: 'red',
        })
      } else {
        notifications.show({
          title: 'Error',
          message: error.message || 'An unexpected error occurred.',
          color: 'red',
        })
      }
    },
  })

  const handlePhotoUpload = (file: File | null) => {
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        notifications.show({
          title: 'File Too Large',
          message: 'Image must be less than 2MB',
          color: 'red',
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        form.setFieldValue('photo', { data: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (values: Partial<UserProfile>) => {
    const payload = {
      ...values,
      birthdate: values.birthdate ? dayjs(values.birthdate).format('YYYY-MM-DD') : undefined,
    }
    mutation.mutate(payload)
  }

  if (!user) return null

  const roleOptions = (roles || []).map((r) => ({
    value: r.id.toString(),
    label: r.name,
  }))

  const ageGroupColor = {
    Adult: 'blue',
    Teenager: 'orange',
    Child: 'green',
  }[user.ageGroupName || 'Adult']

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Stack gap={0}>
            <Title order={2}>Profile Settings</Title>
            <Text c="dimmed" size="sm">
              Manage your identity and household classification
            </Text>
          </Stack>
          <Badge size="lg" color={ageGroupColor} variant="light">
            {user.ageGroupName}
          </Badge>
        </Group>

        <Paper withBorder p="xl" radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="xl">
              <Group align="flex-start" wrap="nowrap">
                <Stack align="center" gap="xs">
                  <Avatar
                    src={getPhotoSrc(form.values.photo?.data || form.values.photo?.url)}
                    size={120}
                    radius={120}
                    variant="filled"
                    color="indigo"
                  >
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </Avatar>
                  <FileButton onChange={handlePhotoUpload} accept="image/png,image/jpeg,image/webp">
                    {(props) => (
                      <Button
                        {...props}
                        variant="light"
                        size="compact-xs"
                        leftSection={<IconCamera size={14} />}
                      >
                        Change Photo
                      </Button>
                    )}
                  </FileButton>
                </Stack>

                <Stack gap="md" style={{ flex: 1 }}>
                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <TextInput
                      label="First Name"
                      value={user.firstName}
                      readOnly
                      leftSection={<IconUser size={16} />}
                      variant="filled"
                      description="Managed by your Google account"
                    />
                    <TextInput
                      label="Last Name"
                      value={user.lastName}
                      readOnly
                      leftSection={<IconUser size={16} />}
                      variant="filled"
                      description="Managed by your Google account"
                    />
                  </SimpleGrid>

                  <TextInput
                    label="Email"
                    value={user.email}
                    readOnly
                    leftSection={<IconMail size={16} />}
                    variant="filled"
                    description="Managed by your Google account"
                  />

                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <DateInput
                      label="Birthdate"
                      placeholder="Pick your birthdate"
                      leftSection={<IconCake size={16} />}
                      required
                      value={form.values.birthdate ? dayjs(form.values.birthdate).toDate() : null}
                      onChange={(date) =>
                        form.setFieldValue(
                          'birthdate',
                          date ? dayjs(date).format('YYYY-MM-DD') : '',
                        )
                      }
                      error={form.errors.birthdate}
                      maxDate={new Date()}
                    />
                    <Select
                      label="Family Role"
                      placeholder="Select your role"
                      data={roleOptions}
                      leftSection={<IconUsers size={16} />}
                      required
                      {...form.getInputProps('familyRoleId')}
                      value={form.values.familyRoleId?.toString()}
                      onChange={(val) =>
                        form.setFieldValue('familyRoleId', val ? parseInt(val) : undefined)
                      }
                    />
                  </SimpleGrid>

                  <TextInput
                    label="Mobile Phone"
                    placeholder="+351 912 345 678"
                    leftSection={<IconPhone size={16} />}
                    {...form.getInputProps('mobilePhone')}
                  />
                </Stack>
              </Group>

              <Title order={4} mt="md">
                Social Profiles
              </Title>

              <SimpleGrid cols={{ base: 1, sm: 3 }}>
                <TextInput
                  label="Facebook"
                  placeholder="https://facebook.com/username"
                  leftSection={<IconBrandFacebook size={16} color="var(--mantine-color-blue-6)" />}
                  {...form.getInputProps('facebook')}
                />
                <TextInput
                  label="Instagram"
                  placeholder="https://instagram.com/username"
                  leftSection={<IconBrandInstagram size={16} color="var(--mantine-color-pink-6)" />}
                  {...form.getInputProps('instagram')}
                />
                <TextInput
                  label="LinkedIn"
                  placeholder="https://linkedin.com/in/username"
                  leftSection={<IconBrandLinkedin size={16} color="var(--mantine-color-blue-7)" />}
                  {...form.getInputProps('linkedin')}
                />
              </SimpleGrid>

              <Group justify="flex-end" mt="xl">
                <Button type="submit" loading={mutation.isPending} size="md" color="indigo">
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Container>
  )
}
