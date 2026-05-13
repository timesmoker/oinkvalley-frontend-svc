/**
 * 런타임 설정 엔드포인트.
 *
 * 클라이언트가 부팅 시 한 번 호출하여 `apiClient` baseURL 등을 채운다.
 * - 값은 k3s 등 컨테이너 런타임에서 환경변수로 주입한다.
 * - `NEXT_PUBLIC_*`처럼 빌드 타임에 박히지 않으므로 이미지 하나로 dev/stg/prod 다 운영 가능.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type RuntimeConfig = {
  apiUrl: string;
  signupEnabled: boolean;
};

export async function GET() {
  const body: RuntimeConfig = {
    apiUrl: (process.env.API_URL ?? "").trim(),
    signupEnabled: (process.env.SIGNUP_ENABLED ?? "").trim() === "true",
  };

  return Response.json(body, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
