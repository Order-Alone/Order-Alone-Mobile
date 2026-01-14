import { clearTokens, loadTokens, parseTokenResponse, saveTokens } from "./tokens";

const API_BASE = "http://13.209.210.38/api";

type RequestOptions = Omit<RequestInit, "body"> & {
  auth?: boolean;
  retry?: boolean;
  body?: unknown;
};

let refreshPromise: Promise<string | null> | null = null;

const parseResponse = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return text;
    }
  }
  return text;
};

const refreshAccessToken = async (refreshToken: string) => {
  const response = await fetch(`${API_BASE}/user/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const data = await parseResponse(response);
  if (!response.ok) {
    clearTokens();
    return null;
  }
  const tokens = parseTokenResponse(data);
  if (!tokens.accessToken) {
    clearTokens();
    return null;
  }
  saveTokens(tokens);
  return tokens.accessToken;
};

export const request = async <T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> => {
  const url = path.startsWith("http")
    ? path
    : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = new Headers(options.headers ?? {});
  const { accessToken, refreshToken } = loadTokens();

  if (options.auth !== false && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const rawBody = options.body;
  let body: BodyInit | null | undefined;
  if (rawBody == null) {
    body = undefined;
  } else if (typeof rawBody === "string") {
    body = rawBody;
  } else if (
    rawBody instanceof FormData ||
    rawBody instanceof Blob ||
    rawBody instanceof URLSearchParams
  ) {
    body = rawBody;
  } else if (rawBody instanceof ArrayBuffer) {
    body = rawBody as BodyInit;
  } else if (ArrayBuffer.isView(rawBody)) {
    body = rawBody as BodyInit;
  } else if (typeof ReadableStream !== "undefined" && rawBody instanceof ReadableStream) {
    body = rawBody;
  } else {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    body = JSON.stringify(rawBody);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body,
  });

  if (response.status === 401 && options.auth !== false && !options.retry) {
    if (!refreshToken) {
      clearTokens();
    } else {
      refreshPromise ??= refreshAccessToken(refreshToken);
      const newAccessToken = await refreshPromise;
      refreshPromise = null;
      if (newAccessToken) {
        return request<T>(path, {
          ...options,
          retry: true,
        });
      }
    }
  }

  const data = await parseResponse(response);
  if (!response.ok) {
    const error = new Error(
      typeof data === "string" ? data : "Request failed"
    ) as Error & { status?: number; data?: unknown };
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
};
