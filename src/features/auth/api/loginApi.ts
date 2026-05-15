import apiClient from "@/lib/api/apiClient";
import type { LoginRequest } from "@/features/auth/api/authTypes";

/**
 * `POST /auth/login` — 본문 `email`, `password`.
 * 토큰은 JSON 이 아니라 `Set-Cookie`(httpOnly) 로 내려온다.
 */
export async function loginApi(email: string, password: string) {
  const body: LoginRequest = {
    email: email.trim(),
    password,
  };
  return apiClient.post<void>("/auth/login", body);
}
