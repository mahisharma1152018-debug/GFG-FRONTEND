/**
 * HTTP gateway for the Express backend.
 *
 * The backend mounts all application routes below /api and returns JSON
 * envelopes such as { success: true, data: ... }. This gateway removes that
 * transport envelope so the rest of the UI can work with domain objects.
 */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  details?: unknown
  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export function isBackendConfigured(): boolean {
  return BASE_URL.length > 0
}

export function getApiBaseUrl(): string {
  return BASE_URL
}

export function mockLatency(ms = 380): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildUrl(path: string, params?: Record<string, unknown>): string {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
  if (!params) return url
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '' || value === 'all') continue
    search.append(key, String(value))
  }
  const query = search.toString()
  return query ? `${url}?${query}` : url
}

function unwrap<T>(payload: any): T {
  if (payload && payload.success === false) {
    throw new ApiError(payload.message ?? 'Request failed', 400, payload)
  }
  if (payload && Object.prototype.hasOwnProperty.call(payload, 'data')) return payload.data as T
  if (payload && Object.prototype.hasOwnProperty.call(payload, 'badges')) return payload.badges as T
  if (payload && Object.prototype.hasOwnProperty.call(payload, 'leaderboard')) return payload.leaderboard as T
  return payload as T
}

async function request<T>(
  path: string,
  init?: RequestInit & { params?: Record<string, unknown> },
): Promise<T> {
  const { params, headers, ...rest } = init ?? {}
  let response: Response
  try {
    response = await fetch(buildUrl(`/api${path.startsWith('/') ? path : `/${path}`}`, params), {
      ...rest,
      credentials: 'include',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...headers },
    })
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Network request failed', 0)
  }

  const payload = await response.json().catch(() => undefined)
  if (!response.ok) {
    throw new ApiError(
      payload?.message ?? `Request failed: ${response.status} ${response.statusText}`,
      response.status,
      payload,
    )
  }
  if (response.status === 204) return undefined as T
  return unwrap<T>(payload)
}

export const api = {
  get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    return request<T>(path, { method: 'GET', params })
  },
  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) })
  },
  put<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, { method: 'PUT', body: body === undefined ? undefined : JSON.stringify(body) })
  },
  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, { method: 'PATCH', body: body === undefined ? undefined : JSON.stringify(body) })
  },
  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' })
  },
}
