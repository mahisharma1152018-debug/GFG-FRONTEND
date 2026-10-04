/**
 * Single HTTP gateway for the whole application.
 *
 * Every backend call in the app goes through `api.get/post/put/patch/delete`.
 * Components never call fetch/axios directly, so swapping mock data for the
 * Express API is limited to this file plus the individual service modules.
 *
 * When VITE_API_BASE_URL is unset the app runs fully on the local mock layer.
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

/** True when a real backend is configured; false => mock data layer. */
export function isBackendConfigured(): boolean {
  return BASE_URL.length > 0
}

/** Artificial latency so loading states are visible during mock development. */
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

async function request<T>(path: string, init?: RequestInit & { params?: Record<string, unknown> }): Promise<T> {
  const { params, headers, ...rest } = init ?? {}

  if (!isBackendConfigured()) {
    throw new ApiError(
      'Backend is not configured. Set VITE_API_BASE_URL or use the mock data layer.',
      503,
    )
  }

  let response: Response
  try {
    response = await fetch(buildUrl(path, params), {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        // TODO: Connect authentication — attach the GitHub OAuth session token.
        ...headers,
      },
    })
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Network request failed', 0)
  }

  if (!response.ok) {
    const details = await response.json().catch(() => undefined)
    throw new ApiError(`Request failed: ${response.status} ${response.statusText}`, response.status, details)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
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
