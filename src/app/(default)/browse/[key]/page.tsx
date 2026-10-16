// src/app/(default)/browse/[key]/page.tsx

import { notFound } from "next/navigation";
import BrowsePostList from "@/features/boards/browse/components/BrowsePostList";
import { fetchBrowsePage, type BrowsePage as BrowsePageData } from "@/features/boards/browse/api/browseQueries";
import { getServerApiBaseUrl, getSsrUpstreamAuthFromRequest } from "@/lib/api/serverBaseUrl";
import { handleProtectedPageError } from "@/lib/auth/handleProtectedPageError";
import { AuthRequiredError } from "@/lib/api/authRequiredError";
import { profilesToNicknameRecord } from "@/features/profile/api/profileSvc";
import { fetchProfilesByIds } from "@/features/profile/api/profileQueries";
import { BROWSE_DEFINITIONS, browseHref, isBrowseKey } from "@/features/boards/browse/lib/browseDefinitions";

export const dynamic = "force-dynamic";

export default async function BrowsePage({
    params,
    searchParams,
}: {
    params: { key: string };
    searchParams: { page?: string };
}) {
    if (!isBrowseKey(params.key)) notFound();

    const parsed = parseInt(searchParams.page || "1", 10);
    const page = Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;

    const definition = BROWSE_DEFINITIONS[params.key];
    const baseUrl = getServerApiBaseUrl();
    const ssrAuth = getSsrUpstreamAuthFromRequest();

    let data: BrowsePageData | null = null;
    try {
        data = await fetchBrowsePage(baseUrl, params.key, page, ssrAuth);
    } catch (err) {
        // 로그인 만료는 기존 보호 페이지 처리(로그인으로), 그 외(검색 서비스 장애)는 아래 안내만
        if (err instanceof AuthRequiredError) {
            handleProtectedPageError(err, browseHref(params.key, page));
        }
    }

    // 닉네임은 게시판 글 목록과 같이 profile 에서 묶어 붙인다 (search-svc 는 authorUserId 만)
    let nicknameByUserId: Record<string, string> = {};
    if (data && data.posts.length > 0) {
        try {
            const ids = [...new Set(data.posts.map((p) => p.authorUserId))];
            nicknameByUserId = profilesToNicknameRecord(await fetchProfilesByIds(baseUrl, ids, ssrAuth));
        } catch {
            /* 프로필 서비스 장애 시 userId 폴백 */
        }
    }

    return (
        <div className="w-full px-0 py-6 sm:px-6 sm:max-w-[950px] sm:mx-auto">
            <div className="mb-4 px-2 sm:px-0">
                <h1 className="text-2xl font-bold">{definition.title}</h1>
                <p className="mt-1 text-sm text-gray-500">{definition.description}</p>
            </div>

            {data ? (
                <BrowsePostList data={data} browseKey={params.key} nicknameByUserId={nicknameByUserId} />
            ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">
                    글 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
                </p>
            )}
        </div>
    );
}
