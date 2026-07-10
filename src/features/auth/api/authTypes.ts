/** `POST /auth/login` — auth-svc `LoginRequest` 와 동일 */
export type LoginRequest = {
  email: string;
  password: string;
};

/** `POST /auth/signup` — auth-svc `SignUpRequest` 와 동일 (`roles` 는 보내지 않음) */
export type SignupRequest = {
  email: string;
  password: string;
  nickname: string;
};

/** auth 오류 응답 (400/401/409 등) */
export type ApiErrorResponse = {
  message: string;
  errors: { field: string; message: string }[];
};

/** `GET /auth/me` */
export type MeResponse = {
  userId: number;
};
