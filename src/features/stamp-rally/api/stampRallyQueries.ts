import type { SsrUpstreamAuth } from "@/lib/api/serverBaseUrl";
import { buildSsrUpstreamFetchInit } from "@/lib/api/serverBaseUrl";
import { AuthRequiredError } from "@/lib/api/authRequiredError";
import type { RallyViewResponse } from "@/features/stamp-rally/api/stampRallyTypes";

export async function fetchMyRally(
  baseUrl: string,
  auth?: SsrUpstreamAuth,
): Promise<RallyViewResponse> {
  const res = await fetch(
    `${baseUrl}/stamp-rallies/me`,
    buildSsrUpstreamFetchInit(auth),
  );
  if (res.status === 401) {
    throw new AuthRequiredError("GET /stamp-rallies/me requires authentication");
  }
  if (!res.ok) {
    throw new Error(`GET /stamp-rallies/me failed: ${res.status}`);
  }
  return (await res.json()) as RallyViewResponse;
}
