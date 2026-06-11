// Thin client-side fetch wrapper around the JSON API envelope ({ ok, data, error }).

export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      headers:
        options.body instanceof FormData
          ? undefined
          : { "Content-Type": "application/json" },
      ...options,
    });
    const json = (await res.json().catch(() => ({}))) as ApiResult<T>;
    if (!res.ok || !json.ok) {
      return { ok: false, error: json.error ?? `Request failed (${res.status})`, details: json.details };
    }
    return { ok: true, data: json.data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: "PATCH", body: JSON.stringify(body) }),
  del: <T>(url: string) => request<T>(url, { method: "DELETE" }),
  upload: <T>(url: string, form: FormData) =>
    request<T>(url, { method: "POST", body: form }),
};
