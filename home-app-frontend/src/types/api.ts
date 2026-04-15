export interface ProblemDetail {
  type: string
  title: string
  status: number
  detail: string
  instance?: string
  errors?: Record<string, string>
}

export interface ApiError extends Error {
  status?: number
  data?: ProblemDetail
}

export interface PagedResponse<T> {
  _embedded: Record<string, T[]>
  page: {
    size: number
    totalElements: number
    totalPages: number
    number: number
  }
  _links: Record<string, { href: string }>
}
