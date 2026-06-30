// src/app/(default)/boards/[slug]/page.tsx

import EntryList from "@/features/boards/post/components/EntryList";
import Link from "next/link";
import { PostEntries } from "@/features/boards/types/postEntries";
import { getServerApiBaseUrl, getSsrUpstreamAuthFromRequest } from "@/lib/api/serverBaseUrl";
import {
    fetchBoardPostsBundle,
} from "@/features/boards/api/boardSvc";
import {
    handleProtectedPageError,
    redirectForbidden,
} from "@/lib/auth/handleProtectedPageError";
import { profilesToNicknameRecord } from "@/features/profile/api/profileSvc";
import { fetchProfilesByIds } from "@/features/profile/api/profileQueries";

export default async function BoardPage({
                                            params,
                                            searchParams,
                                        }: {
    params: { slug: string };
    searchParams: { page?: string };
}) {
    const page = parseInt(searchParams.page || '0', 10);

    const baseUrl = getServerApiBaseUrl();
    const ssrAuth = getSsrUpstreamAuthFromRequest();

    let bundle;
    try {
        bundle = await fetchBoardPostsBundle(baseUrl, params.slug, page, 20, ssrAuth);
    } catch (err) {
        const next = page > 0 ? `/boards/${params.slug}?page=${page}` : `/boards/${params.slug}`;
        handleProtectedPageError(err, next);
    }
    if (!bundle) redirectForbidden();

    const board = bundle.board;
    const data = bundle.posts;

    const rows: PostEntries[] = data.content;

    let nicknameByUserId: Record<string, string> = {};
    try {
        const ids = [...new Set(rows.map((r) => r.userId))];
        const profiles = await fetchProfilesByIds(
            baseUrl,
            ids,
            ssrAuth,
        );
        nicknameByUserId = profilesToNicknameRecord(profiles);
    } catch {
        /* 프로필 서비스 장애 시 userId 폴백 */
    }

    return (
        <div className="w-full px-0 py-6 sm:px-6 sm:max-w-[950px] sm:mx-auto">
            <h1 className="text-2xl font-bold mb-4">{board.name}</h1>

            <EntryList
                posts={rows}
                boardSlug={params.slug}
                page={page}
                totalPages={data.totalPages}
                nicknameByUserId={nicknameByUserId}
            />

            <div className="mt-8 flex justify-end">
                <Link
                    href={`/boards/${params.slug}/write`}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-500 transition"
                >
                    글쓰기
                </Link>
            </div>
        </div>
    );
}
