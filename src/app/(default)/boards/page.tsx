// src/app/(default)/boards/page.tsx
import BoardSelector from "@/features/boards/post/components/BoardSelector";
import { fetchBoards } from "@/features/boards/api/boardSvc";
import { getServerApiBaseUrl, getSsrUpstreamAuthFromRequest } from "@/lib/api/serverBaseUrl";

// 빌드 타임 prerender 비활성화 — API_URL은 런타임에 주입되므로 모든 요청을 서버에서 처리해야 한다.
export const dynamic = "force-dynamic";

export default async function BoardsPage() {
    const baseUrl = getServerApiBaseUrl();
    const ssrAuth = getSsrUpstreamAuthFromRequest();

    let initialBoards: Awaited<ReturnType<typeof fetchBoards>> = [];
    let fetchFailed = false;
    try {
        initialBoards = await fetchBoards(baseUrl, ssrAuth);
    } catch {
        fetchFailed = true;
    }

    return <BoardSelector initialBoards={initialBoards} fetchFailed={fetchFailed} />;
}
