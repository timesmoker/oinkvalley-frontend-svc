import apiClient from "@/lib/api/apiClient";
import type { BrowseKey } from "@/features/boards/browse/lib/browseDefinitions";
import type { BrowsePage, BrowsePost } from "@/features/boards/browse/api/browseTypes";

/** 둘러보기 한 페이지 (클라이언트). page 는 1부터. SSR 은 browseQueries.fetchBrowsePage. */
export async function fetchBrowsePageClient(
    key: BrowseKey,
    page: number,
    size: number,
    excludeAi: boolean,
): Promise<BrowsePage> {
    const res = await apiClient.get<BrowsePage>(`/browse/${key}/posts`, {
        params: { page, size, ...(excludeAi ? { excludeAi: true } : {}) },
    });
    return res.data;
}

/** 글 id 묶음 — 볼 수 있는 글만 요청 순서대로 (서버 상한 20개). */
export async function fetchBrowsePostsByIds(ids: number[]): Promise<BrowsePost[]> {
    if (ids.length === 0) return [];
    const res = await apiClient.get<{ posts: BrowsePost[] }>("/browse/posts", { params: { ids: ids.join(",") } });
    return res.data.posts;
}
