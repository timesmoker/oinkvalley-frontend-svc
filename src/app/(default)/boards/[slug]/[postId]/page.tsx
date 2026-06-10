// src/app/(default)/boards/[slug]/[postId]/page.tsx

import {PostDetail} from "@/features/boards/types/posts";
import dynamic from "next/dynamic";
import { getServerApiBaseUrl, getSsrUpstreamAuthFromRequest } from "@/lib/api/serverBaseUrl";
import {
    fetchBoardMetaBySegment,
    fetchPostBySegment,
} from "@/features/boards/api/boardSvc";
import {
    handleProtectedPageError,
    redirectForbidden,
} from "@/lib/auth/handleProtectedPageError";
import {
    authorLabel,
    profilesToNicknameRecord,
} from "@/features/profile/api/profileSvc";
import { fetchProfilesByIds } from "@/features/profile/api/profileQueries";
import PostOwnerActions from "@/features/boards/components/PostOwnerActions";
import { formatPostDateTime } from "@/features/boards/lib/formatPostDate";

const Viewer = dynamic(() => import('@/features/boards/components/Viewer'), { ssr: false });
const Comments = dynamic(() => import('@/features/boards/components/Comments'), { ssr: false })


export default async function PostPage({ params }: { params: { slug: string; postId: string } }) {
    const baseUrl = getServerApiBaseUrl();
    const ssrAuth = getSsrUpstreamAuthFromRequest();

    let board;
    let loaded;
    try {
        board = await fetchBoardMetaBySegment(baseUrl, params.slug, ssrAuth);
        if (!board) redirectForbidden();
        loaded = await fetchPostBySegment(baseUrl, params.slug, params.postId, ssrAuth);
    } catch (err) {
        handleProtectedPageError(err, `/boards/${params.slug}/${params.postId}`);
    }
    if (!loaded || loaded.boardId !== board.id) redirectForbidden();

    const post: PostDetail = loaded;

    let nicknameByUserId: Record<string, string> = {};
    try {
        const profiles = await fetchProfilesByIds(
            baseUrl,
            [post.userId],
            ssrAuth,
        );
        nicknameByUserId = profilesToNicknameRecord(profiles);
    } catch {
        /* 프로필 실패 시 userId 폴백 */
    }

    const authorDisplay = authorLabel(nicknameByUserId, post.userId);

    return (
        <div className="w-full px-0 py-6 sm:px-6 sm:max-w-[950px] sm:mx-auto">
            {/* 게시판 이름 */}
            <h1 id="board-post-scroll-anchor" className="text-2xl font-bold mb-4">{board.name}</h1>

            {/* 전체 박스 */}
            <div className="border border-gray-300 rounded-md overflow-hidden text-sm">
                {/* 제목 줄 */}
                <div className="border-b px-4 py-2 bg-gray-50 font-medium">
                    제목 : {post.title}
                </div>

                {/* 작성자 + 날짜 줄 */}
                <div className="border-b px-4 py-2 flex justify-between text-sm text-gray-700">
                    <span>작성자 : {authorDisplay}</span>

                    <span>작성시각 : {formatPostDateTime(post.createdAt)}</span>
                </div>


                {/* 본문 — 에디터와 동일 폭 (prose/좌우 padding 없음) */}
                <div className="bg-white min-h-[200px]">
                    <Viewer
                        content={post.content}
                        postTitle={post.title}
                        proseminHeight="50vh"
                        showTableOfContents
                    />
                </div>

            </div>
            <PostOwnerActions
                boardSlug={params.slug}
                postId={params.postId}
                authorUserId={post.userId}
            />
            <div className="w-full mx-auto space-y-6">
                <Comments postId={params.postId} />
            </div>
        </div>
    )

}
