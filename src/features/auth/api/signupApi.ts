import apiClient from "@/lib/api/apiClient";
import type { SignupRequest } from "@/features/auth/api/authTypes";

export type SignupInput = SignupRequest;

/**
 * `POST /auth/signup` — 요청 `email`, `password`, `nickname`.
 * 성공 시 201, 응답 본문 없음(로그인과 동일).
 */
export async function signupApi(input: SignupInput) {
  const body: SignupRequest = {
    email: input.email.trim(),
    password: input.password,
    nickname: input.nickname.trim(),
  };
  return apiClient.post<void>("/auth/signup", body);
}
