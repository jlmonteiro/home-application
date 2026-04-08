import {
  Card,
  TextInput,
  Button,
  Avatar,
  Stack,
  Group,
  Title,
  Text,
  FileButton,
  ActionIcon,
  Tooltip,
  Container,
  Paper,
  SimpleGrid,
} from '@mantine/core'
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
} from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUserProfile, type ProblemDetail } from '../services/api'
import { notifications } from '@mantine/notifications'
import type { UserProfile } from '../types/user'

const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/
const FACEBOOK_REGEX = /^https?:\/\/(www\.)?facebook\.com\/.*$/
const INSTAGRAM_REGEX = /^https?:\/\/(www\.)?instagram\.com\/.*$/
const LINKEDIN_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/.*$/

export function ProfilePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const form = useForm<Partial<UserProfile>>({
    initialValues: {
      photo: user?.photo || '',
      facebook: user?.facebook || '',
      mobilePhone: user?.mobilePhone || '',
      instagram: user?.instagram || '',
      linkedin: user?.linkedin || '',
    },

    validate: {
      mobilePhone: (value) =>
        value && !PHONE_REGEX.test(value)
          ? 'Mobile phone must be a valid phone number'
          : null,
      facebook: (value) =>
        value && !FACEBOOK_REGEX.test(value)
          ? 'Facebook must be a valid Facebook URL'
          : null,
      instagram: (value) =>
        value && !INSTAGRAM_REGEX.test(value)
          ? 'Instagram must be a valid Instagram URL'
          : null,
      linkedin: (value) =>
        value && !LINKEDIN_REGEX.test(value)
          ? 'LinkedIn must be a valid LinkedIn URL'
          : null,
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
    onError: (error: any) => {
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
        form.setFieldValue('photo', reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (values: Partial<UserProfile>) => {
    mutation.mutate(values)
  }

  if (!user) return null

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Title order={2}>Profile Settings</Title>

        <Paper withBorder p="xl" radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="xl">
              <Group align="flex-start">
                <Stack align="center" gap="xs">
                  <Avatar
                    src={form.values.photo}
                    size={120}
                    radius={120}
                    variant="filled"
                    color="indigo"
                  >
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </Avatar>
                  <FileButton
                    onChange={handlePhotoUpload}
                    accept="image/png,image/jpeg,image/webp"
                  >
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
                  leftSection={
                    <IconBrandFacebook size={16} color="var(--mantine-color-blue-6)" />
                  }
                  {...form.getInputProps('facebook')}
                />
                <TextInput
                  label="Instagram"
                  placeholder="https://instagram.com/username"
                  leftSection={
                    <IconBrandInstagram size={16} color="var(--mantine-color-pink-6)" />
                  }
                  {...form.getInputProps('instagram')}
                />
                <TextInput
                  label="LinkedIn"
                  placeholder="https://linkedin.com/in/username"
                  leftSection={
                    <IconBrandLinkedin size={16} color="var(--mantine-color-blue-7)" />
                  }
                  {...form.getInputProps('linkedin')}
                />
              </SimpleGrid>

              <Group justify="flex-end" mt="xl">
                <Button
                  type="submit"
                  loading={mutation.isPending}
                  size="md"
                  color="indigo"
                >
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
