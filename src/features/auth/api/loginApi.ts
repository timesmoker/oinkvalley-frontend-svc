import apiClient from "@/lib/api/apiClient";

export type LoginResponse = {
  accessToken?: string;
  tokenType?: string;
  expiresInSeconds?: number;
};

/** `POST /auth/login` — 본문 `email`(로그인 ID), `password` */
export async function loginApi(email: string, password: string) {
  return apiClient.post<LoginResponse>("/auth/login", { email, password });
}
