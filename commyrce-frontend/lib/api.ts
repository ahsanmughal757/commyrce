export const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_ENDPOINT ||
  process.env.API_BASE_ENDPOINT ||
  'http://localhost:3001'
).replace(/\/+$/, '')

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError
}

/** Is this an expected 'not authenticated/auth required' response (401 / 403)? */
export function isAuthError(err: unknown): boolean {
  return isApiError(err) && (err.status === 401 || err.status === 403)
}

export type QueryParams = Record<string, string | number | boolean | undefined>

interface ApiRequestInit extends Omit<RequestInit, 'query'> {
  query?: QueryParams
}

export async function apiFetch<T>(path: string, init?: ApiRequestInit): Promise<T> {
  const url = new URL(API_BASE + path)
  const query = init?.query
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === '') continue
      url.searchParams.set(key, String(value))
    }
  }

  const headers: Record<string, string> = {}
  if (!(init?.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  let res: Response
  try {
    res = await fetch(url, {
      ...init,
      headers: { ...headers, ...(init?.headers ?? {}) },
      credentials: 'include'
    })
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Please check your connection and try again.')
  }

  const text = await res.text()
  let data: unknown = {}
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = {}
    }
  }

  if (!res.ok) {
    const body = data as { message?: string; error?: string; success?: boolean }
    const message = body?.message || body?.error || `Request failed (${res.status})`
    throw new ApiError(res.status === 0 ? 0 : res.status, message)
  }

  return data as T
}