export type Tokens = {
  accessToken?: string;
  refreshToken?: string;
  userName?: string;
};

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const NAME_KEY = "userName";

export const loadTokens = (): Tokens => ({
  accessToken: localStorage.getItem(ACCESS_KEY) ?? undefined,
  refreshToken: localStorage.getItem(REFRESH_KEY) ?? undefined,
  userName: localStorage.getItem(NAME_KEY) ?? undefined,
});

export const saveTokens = (tokens: Tokens) => {
  if (tokens.accessToken) {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  }
  if (tokens.refreshToken) {
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  }
  if (tokens.userName) {
    localStorage.setItem(NAME_KEY, tokens.userName);
  }
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(NAME_KEY);
};

export const parseTokenResponse = (data: unknown): Tokens => {
  let payload: unknown = data;
  if (typeof payload === "string") {
    const trimmed = payload.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        payload = JSON.parse(trimmed);
      } catch {
        return { accessToken: payload };
      }
    } else {
      return { accessToken: payload };
    }
  }

  if (!payload || typeof payload !== "object") {
    return {};
  }

  const obj = payload as Record<string, unknown>;
  const accessToken =
    (obj.accessToken as string | undefined) ??
    (obj.access_token as string | undefined) ??
    (obj.token as string | undefined) ??
    (obj.access as string | undefined) ??
    (obj.jwt as string | undefined);
  const refreshToken =
    (obj.refreshToken as string | undefined) ??
    (obj.refresh_token as string | undefined) ??
    (obj.refresh as string | undefined);
  const userName =
    (obj.userName as string | undefined) ??
    (obj.user_name as string | undefined) ??
    (obj.username as string | undefined) ??
    (obj.name as string | undefined);

  return { accessToken, refreshToken, userName };
};
