import apiClient from "@/lib/api/apiClient";

export type SignupInput = {
  /** 로그인 ID — 이후 `POST /auth/login` 본문 `email`과 동일 */
  email: string;
  password: string;
  /** 게시판·댓글 등에 표시되는 닉네임 (로그인 ID 아님) */
  nickname: string;
};

/** `POST /auth/signup` — 본문 `email`, `password`, `nickname` */
export async function signupApi(input: SignupInput) {
  return apiClient.post("/auth/signup", input);
}
