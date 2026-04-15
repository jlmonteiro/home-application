export interface AgeGroupConfig {
  id: number
  name: string
  minAge: number
  maxAge: number
}

export interface FamilyRole {
  id: number
  name: string
  immutable: boolean
}

export interface UserPreference {
  showShoppingWidget: boolean
  showCouponsWidget: boolean
  version: number
}
