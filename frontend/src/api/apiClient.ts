/**
 * apiClient.ts
 *
 * A thin fetch-based API client that:
 *  1. Reads the CSRF token from the csrftoken cookie
 *  2. Sends X-CSRFToken header on mutating requests
 *  3. Always sends credentials (session cookie)
 *  4. Throws on non-2xx responses with a structured ApiError
 */

export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;
  constructor(status: number, data: unknown, message?: string) {
    super(message ?? `HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function getCsrfToken(): string {
  const match = document.cookie.match(/(?:^|;)\s*csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

const BASE = '';            // empty string → requests go to same origin
                            // Vite proxy forwards /api/* to http://127.0.0.1:8000

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown
): Promise<T> {
  const mutating = !['GET', 'HEAD'].includes(method);
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  if (mutating) {
    headers['X-CSRFToken'] = getCsrfToken();
  }

  let init: RequestInit = {
    method,
    credentials: 'include',
    headers,
  };

  if (body instanceof FormData) {
    // Let browser set multipart Content-Type automatically
    init = { ...init, body };
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init = { ...init, body: JSON.stringify(body) };
  }

  const res = await fetch(`${BASE}${path}`, init);

  if (res.status === 204) return undefined as unknown as T;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }

  return data as T;
}

const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T = void>(path: string) => request<T>('DELETE', path),

  /** Ensure the session has a CSRF cookie before any mutation. */
  async initCsrf() {
    await this.get('/api/auth/csrf/');
  },
};

export default apiClient;
