export interface Link {
  href: string
}

export interface UserProfile {
  id: number
  email: string
  firstName: string
  lastName: string
  enabled: boolean
  birthdate?: string
  familyRole?: {
    id: number
    name: string
    immutable: boolean
  }
  ageGroupName: 'Adult' | 'Teenager' | 'Child'
  photo?: { data?: string; url?: string }
  mobilePhone?: string
  social?: {
    facebook?: string
    instagram?: string
    linkedin?: string
  }
  _links?: {
    self: Link
    [key: string]: Link
  }
}
