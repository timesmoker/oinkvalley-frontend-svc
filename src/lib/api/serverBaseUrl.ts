import { headers } from "next/headers";

/**
 * 서버 컴포넌트(SSR)에서 API 베이스 URL을 반환한다.
 *
 * - 값은 컨테이너 런타임에 `API_URL` 환경변수로 주입한다.
 *   예: `https://api.oinkvalley.example`
 * - 운영 가정: 절대 URL이어야 한다. 비어 있으면 명시적으로 throw.
 */
export function getServerApiBaseUrl(): string {
  const configured = (process.env.API_URL ?? "").trim();
  if (!configured) {
    throw new Error(
      "API_URL is not configured. Set the `API_URL` environment variable to an absolute URL (e.g. https://api.oinkvalley.example).",
    );
  }
  return configured.replace(/\/+$/, "");
}

/**
 * 브라우저가 Next(RSC) 요청에 실은 `Cookie` 헤더 원문.
 * 서버에서 백엔드로 `fetch`할 때 그대로 넘기면 **httpOnly 인증 쿠키**가 API까지 이어짐
 * (클라이언트 `axios`의 `withCredentials: true`와 같은 역할을 서버에서 수동 수행).
 */
export function getForwardedCookieHeader(): string {
  const h = headers();
  return h.get("cookie") ?? "";
}

/**
 * Traefik 등이 **BFF(Next)로 넘기기 전에** 붙인 `Authorization` (예: `Bearer …`).
 * SSR에서 API로 재요청할 때 같이 실어 주면, **브라우저→BFF와 동일한 인증 헤더**를 API까지 이을 수 있음.
 */
export function getForwardedAuthorizationHeader(): string {
  const h = headers();
  return h.get("authorization") ?? "";
}

/** SSR에서 API 업스트림으로 전달할 인증 헤더 묶음 */
export type SsrUpstreamAuth = {
  cookieHeader?: string;
  authorizationHeader?: string;
};

/**
 * RSC 한 번에서 `headers()`를 읽어 Cookie + Authorization을 묶어 준다.
 * (Traefik → BFF → API 흐름에서 BFF가 API를 대신 호출할 때 사용.)
 */
export function getSsrUpstreamAuthFromRequest(): SsrUpstreamAuth {
  const cookie = getForwardedCookieHeader().trim();
  const authorization = getForwardedAuthorizationHeader().trim();
  return {
    ...(cookie ? { cookieHeader: cookie } : {}),
    ...(authorization ? { authorizationHeader: authorization } : {}),
  };
}

/**
 * SSR 업스트림 `fetch` 공통 옵션.
 * `auth`는 보통 `getSsrUpstreamAuthFromRequest()` 결과를 넘긴다.
 */
export function buildSsrUpstreamFetchInit(auth?: SsrUpstreamAuth | null): RequestInit {
  const headers: Record<string, string> = {};
  if (auth?.cookieHeader?.trim()) {
    headers.cookie = auth.cookieHeader.trim();
  }
  if (auth?.authorizationHeader?.trim()) {
    headers.authorization = auth.authorizationHeader.trim();
  }
  return {
    cache: "no-store",
    ...(Object.keys(headers).length ? { headers } : {}),
  };
}
