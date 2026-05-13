import type { SsrUpstreamAuth } from "@/lib/api/serverBaseUrl";
import { buildSsrUpstreamFetchInit } from "@/lib/api/serverBaseUrl";
import type { ProfileResponse } from "@/features/profile/api/profileSvc";

/**
 * 서버(RSC)에서 `GET /profiles?ids=…` 호출.
 * 클라 번들에 끌려가지 않도록 `serverBaseUrl` 의존성은 이 파일에 격리한다.
 */
export async function fetchProfilesByIds(
  baseUrl: string,
  ids: number[],
  auth?: SsrUpstreamAuth,
): Promise<ProfileResponse[]> {
  const unique = [...new Set(ids.filter((n) => Number.isFinite(n)))];
  if (unique.length === 0) return [];

  const url = new URL(`${baseUrl}/profiles`);
  url.searchParams.set("ids", unique.join(","));

  const res = await fetch(url.toString(), buildSsrUpstreamFetchInit(auth));

  if (!res.ok) {
    throw new Error(`GET /profiles failed: ${res.status}`);
  }

  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  return data as ProfileResponse[];
}
