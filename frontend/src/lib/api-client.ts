/**
 * Frontend → backend REST client.
 *
 * All backend calls go through `NEXT_PUBLIC_API_URL` with `credentials: "include"`
 * so the httpOnly session cookie is sent (see task.md §3.2).
 */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Low-level fetch against the backend. Returns the raw `Response`. */
export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = /^https?:\/\//.test(path) ? path : `${API_URL}${path}`;

  return fetch(url, {
    credentials: "include",
    ...init,
  });
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/** Fetch + parse JSON, throwing `ApiError` on non-2xx responses. */
export async function apiRequest<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await apiFetch(path, init);
  const data = (await response.json().catch(() => null)) as
    | { error?: string }
    | null;

  if (!response.ok) {
    throw new ApiError(
      data?.error ?? response.statusText ?? "Request failed",
      response.status,
      data,
    );
  }

  return data as T;
}

function jsonInit(method: string, body?: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  };
}

export const apiClient = {
  get: <T = unknown>(path: string) => apiRequest<T>(path),
  post: <T = unknown>(path: string, body?: unknown) =>
    apiRequest<T>(path, jsonInit("POST", body)),
  put: <T = unknown>(path: string, body?: unknown) =>
    apiRequest<T>(path, jsonInit("PUT", body)),
  patch: <T = unknown>(path: string, body?: unknown) =>
    apiRequest<T>(path, jsonInit("PATCH", body)),
  delete: <T = unknown>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
};
