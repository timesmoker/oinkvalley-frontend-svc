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
import {
    boardPostArticleColumnClassName,
    boardPostDocumentShellClassName,
    boardPostMetaRowClassName,
    boardPostTitleBlockClassName,
    boardPostTitleClassName,
} from "@/features/boards/lib/boardPostContentLayout";

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

            <div className={boardPostDocumentShellClassName}>
                <div className={boardPostArticleColumnClassName}>
                    <div className={boardPostTitleBlockClassName}>
                        <h1 className={boardPostTitleClassName}>{post.title}</h1>
                    </div>

                    <div className={boardPostMetaRowClassName}>
                        <span>{authorDisplay}</span>
                        <span>{formatPostDateTime(post.createdAt)}</span>
                    </div>

                    <Viewer
                        content={post.content}
                        postTitle={post.title}
                        proseminHeight="50vh"
                        showTableOfContents
                        embeddedInArticle
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
