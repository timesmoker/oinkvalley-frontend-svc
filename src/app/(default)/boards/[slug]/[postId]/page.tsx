// src/app/(default)/boards/[slug]/[postId]/page.tsx

import { notFound } from "next/navigation";
import {PostDetail} from "@/features/boards/types/posts";
import dynamic from "next/dynamic";
import { getServerApiBaseUrl, getSsrUpstreamAuthFromRequest } from "@/lib/api/serverBaseUrl";
import {
    fetchBoardMetaBySegment,
    fetchPostBySegment,
} from "@/features/boards/api/boardSvc";
import { handleBoardPageError } from "@/features/boards/api/handleBoardPageError";
import {
    authorLabel,
    profilesToNicknameRecord,
} from "@/features/profile/api/profileSvc";
import { fetchProfilesByIds } from "@/features/profile/api/profileQueries";
import PostOwnerActions from "@/features/boards/components/PostOwnerActions";

const Viewer = dynamic(() => import('@/features/boards/components/Viewer'), { ssr: false });
const Comments = dynamic(() => import('@/features/boards/components/Comments'), { ssr: false })


export default async function PostPage({ params }: { params: { slug: string; postId: string } }) {
    const baseUrl = getServerApiBaseUrl();
    const ssrAuth = getSsrUpstreamAuthFromRequest();

    let board;
    let loaded;
    try {
        board = await fetchBoardMetaBySegment(baseUrl, params.slug, ssrAuth);
        if (!board) return notFound();
        loaded = await fetchPostBySegment(baseUrl, params.slug, params.postId, ssrAuth);
    } catch (err) {
        handleBoardPageError(err, `/boards/${params.slug}/${params.postId}`);
    }
    if (!loaded || loaded.boardId !== board.id) return notFound();

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
            <h1 className="text-2xl font-bold mb-4">{board.name}</h1>

            {/* 전체 박스 */}
            <div className="border border-gray-300 rounded-md overflow-hidden text-sm">
                {/* 제목 줄 */}
                <div className="border-b px-4 py-2 bg-gray-50 font-medium">
                    제목 : {post.title}
                </div>

                {/* 작성자 + 날짜 줄 */}
                <div className="border-b px-4 py-2 flex justify-between text-sm text-gray-700">
                    <span>작성자 : {authorDisplay}</span>

                    <span>작성시각 :{' '}
                        {new Date(post.createdAt).toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                </div>


                {/* 본문 내용 줄 */}
                <div className="px-4 py-6 bg-white">
                    <div className="prose min-h-[200px]">
                        <Viewer
                            content={post.content}
                            proseminHeight="50vh"
                        />
                    </div>
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
