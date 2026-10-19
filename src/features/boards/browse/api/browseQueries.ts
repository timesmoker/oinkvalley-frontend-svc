import type { BrowseKey } from "@/features/boards/browse/lib/browseDefinitions";
import type { SsrUpstreamAuth } from "@/lib/api/serverBaseUrl";
import { buildSsrUpstreamFetchInit } from "@/lib/api/serverBaseUrl";
import { AuthRequiredError } from "@/lib/api/authRequiredError";
import type { BrowsePage } from "@/features/boards/browse/api/browseTypes";

export const BROWSE_PAGE_SIZE = 20;

/**
 * 둘러보기 한 페이지 (SSR).
 * @param page 1부터 시작
 */
export async function fetchBrowsePage(
    baseUrl: string,
    key: BrowseKey,
    page: number,
    excludeAi: boolean,
    auth?: SsrUpstreamAuth,
): Promise<BrowsePage> {
    const url = new URL(`${baseUrl}/browse/${key}/posts`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("size", String(BROWSE_PAGE_SIZE));
    if (excludeAi) url.searchParams.set("excludeAi", "true");

    const res = await fetch(url.toString(), buildSsrUpstreamFetchInit(auth));
    if (res.status === 401) {
        throw new AuthRequiredError("로그인 정보가 유효하지 않습니다. 다시 로그인해 주세요.");
    }
    if (!res.ok) {
        throw new Error(`GET /browse/${key}/posts failed: ${res.status}`);
    }
    return (await res.json()) as BrowsePage;
}
