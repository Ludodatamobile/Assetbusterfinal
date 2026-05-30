export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ApiOptions {
  method?: RequestMethod
  body?: unknown
  token?: string | null
  headers?: HeadersInit
}

export interface ApiSuccessResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export class ApiClientError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.data = data
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', body, token, headers = {} } = options

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    credentials: 'include',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get('content-type')
  const data = contentType?.includes('application/json')
    ? await response.json().catch(() => null)
    : null

  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      `Request failed with status ${response.status}`

    throw new ApiClientError(message, response.status, data)
  }

  return data as T
}

export async function apiUpload<T>(
  endpoint: string,
  formData: FormData,
  token?: string | null
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      `Request failed with status ${response.status}`

    throw new ApiClientError(message, response.status, data)
  }

  return data as T
}