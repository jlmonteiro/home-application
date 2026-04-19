export interface ShoppingCategory {
  id: number
  name: string
  description?: string
  icon?: string
  version: number
  _links?: {
    self: { href: string }
  }
}

export interface ShoppingItem {
  id: number
  name: string
  photo?: { data?: string; url?: string }
  unit: string
  pcQuantity?: number
  pcUnit?: string
  nutritionSampleSize: number
  nutritionSampleUnit: string
  category: {
    id: number
    name: string
    icon?: string
  }
  version: number
  _links?: {
    self: { href: string }
  }
}

export interface ShoppingItemPriceHistory {
  id: number
  storeId: number | null
  storeName: string | null
  price: number
  recordedAt: string
}

export interface ShoppingStore {
  id: number
  name: string
  description?: string
  icon?: string
  photo?: { data?: string; url?: string }
  validCouponsCount?: number
  version: number
  _links?: {
    self: { href: string }
    loyaltyCards: { href: string }
    coupons: { href: string }
  }
}

export interface LoyaltyCard {
  id: number
  store: {
    id: number
    name: string
  }
  name: string
  barcode: {
    code: string
    type: 'QR' | 'CODE_128'
  }
  version: number
  _links?: {
    self: { href: string }
    delete: { href: string }
  }
}

export interface Coupon {
  id: number
  store: {
    id: number
    name: string
  }
  name: string
  description?: string
  value?: string
  photo?: string
  dueDate?: string
  barcode?: {
    code: string
    type: 'QR' | 'CODE_128'
  }
  used: boolean
  version: number
  _links?: {
    self: { href: string }
    delete: { href: string }
  }
}

export interface ShoppingListItem {
  id: number
  item: {
    id: number
    name: string
    photo: { url: string | null } | null
    unit: string
    pcQuantity?: number
    pcUnit?: string
    category?: {
      name: string
      icon?: string
    } | null
  }
  store?: {
    id: number | null
    name: string | null
  } | null
  quantity: number
  unit: string
  pricing?: {
    price: number | null
    previousPrice: number | null
  } | null
  bought: boolean
  unavailable: boolean
  version: number
  _links?: {
    self: { href: string }
    update: { href: string }
    remove: { href: string }
  }
}

export interface ShoppingList {
  id: number
  name: string
  description?: string
  status: 'PENDING' | 'COMPLETED'
  createdBy: string
  creatorName: string
  items: ShoppingListItem[]
  createdAt: string
  completedAt: string | null
  version: number
  _links?: {
    self: { href: string }
    lists: { href: string }
  }
}
