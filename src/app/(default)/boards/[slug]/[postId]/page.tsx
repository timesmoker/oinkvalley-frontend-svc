// src/app/(default)/boards/[slug]/[postId]/page.tsx

import {PostDetail} from "@/features/boards/types/posts";
import dynamic from "next/dynamic";
import Link from "next/link";
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
import PostOwnerActions from "@/features/boards/post/components/PostOwnerActions";
import { BROWSE_DEFINITIONS, browseHref, isBrowseKey } from "@/features/boards/browse/lib/browseDefinitions";
import { formatPostDateTime } from "@/features/boards/lib/formatPostDate";
import { BOARD_POST_DOCUMENT_SHELL_ID } from "@/features/boards/lib/boardPostScrollAnchor";
import {
    boardPostArticleColumnClassName,
    boardPostDocumentShellClassName,
    boardPostMetaRowClassName,
    boardPostTitleBlockClassName,
    boardPostTitleClassName,
} from "@/features/boards/shared/layout/boardPostSurfaceStyles";

const Viewer = dynamic(() => import('@/features/boards/viewer/components/Viewer'), { ssr: false });
const Comments = dynamic(() => import('@/features/boards/comment/components/Comments'), { ssr: false })


export default async function PostPage({
    params,
    searchParams,
}: {
    params: { slug: string; postId: string };
    searchParams: { from?: string; page?: string };
}) {
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

    // 전체 게시글 등 둘러보기에서 들어온 경우: 같은 글 주소를 쓰되 상단 제목·복귀 경로만 둘러보기 기준으로
    const fromBrowse = searchParams.from && isBrowseKey(searchParams.from) ? searchParams.from : null;
    const browsePage = parseInt(searchParams.page || "1", 10);
    const backHref = fromBrowse ? browseHref(fromBrowse, browsePage) : `/boards/${params.slug}`;
    const backLabel = fromBrowse ? BROWSE_DEFINITIONS[fromBrowse].title : board.name;

    return (
        <div className="w-full px-0 py-6 sm:px-6 sm:max-w-[950px] sm:mx-auto">
            {/* 게시판 이름 (둘러보기에서 왔으면 둘러보기 이름 + 올라온 게시판 부제) */}
            <div className="mb-4">
                <h1 id="board-post-scroll-anchor" className="text-2xl font-bold">
                    <Link href={backHref} className="hover:underline">
                        {backLabel}
                    </Link>
                </h1>
                {fromBrowse && (
                    <p className="mt-1 text-sm text-gray-500">
                        <Link href={`/boards/${params.slug}`} className="hover:text-black hover:underline">
                            {board.name}
                        </Link>
                        에 올라온 글
                    </p>
                )}
            </div>

            <div id={BOARD_POST_DOCUMENT_SHELL_ID} className={boardPostDocumentShellClassName}>
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
            {fromBrowse && (
                <div className="mt-4 flex justify-end">
                    <Link
                        href={`/boards/${params.slug}`}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 transition hover:border-pink-300 hover:text-black"
                    >
                        {board.name} 게시판으로 이동
                    </Link>
                </div>
            )}
            <div className="w-full mx-auto space-y-6">
                <Comments postId={params.postId} />
            </div>
        </div>
    )

}
