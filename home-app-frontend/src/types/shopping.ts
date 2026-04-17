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
  photo?: string
  unit: string
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
  photo?: string
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
  itemId: number
  itemName: string
  itemPhoto: string
  category: {
    name: string
    icon?: string
  }
  store?: {
    id: number | null
    name: string | null
  } | null
  quantity: number
  unit: string
  price: number | null
  previousPrice: number | null
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
