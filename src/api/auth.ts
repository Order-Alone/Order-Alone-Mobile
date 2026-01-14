import { request } from "./client";
import { clearTokens, parseTokenResponse, saveTokens } from "./tokens";

export const signup = async (payload: {
  name: string;
  accountId: string;
  password: string;
}) => {
  const data = await request("/user/signup", {
    method: "POST",
    body: payload,
    auth: false,
  });
  const tokens = parseTokenResponse(data);
  saveTokens(tokens);
  return { data, tokens };
};

export const login = async (payload: {
  accountId: string;
  password: string;
}) => {
  const data = await request("/user/login", {
    method: "POST",
    body: payload,
    auth: false,
  });
  const tokens = parseTokenResponse(data);
  saveTokens(tokens);
  return { data, tokens };
};

export const logout = () => {
  clearTokens();
};
