export interface Link {
  href: string
}

export interface UserProfile {
  id: number
  email: string
  firstName: string
  lastName: string
  enabled: boolean
  photo?: string
  facebook?: string
  mobilePhone?: string
  instagram?: string
  linkedin?: string
  _links?: {
    self: Link
    [key: string]: Link
  }
}
