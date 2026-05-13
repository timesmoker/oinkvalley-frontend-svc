// src/app/office-of-architect/write/page.tsx
import dynamic from 'next/dynamic'
import { notFound } from "next/navigation";
import { getServerApiBaseUrl, getSsrUpstreamAuthFromRequest } from "@/lib/api/serverBaseUrl";
import {
    fetchBoardWriteMetaBySegment,
} from "@/features/boards/api/boardSvc";
import { handleBoardPageError } from "@/features/boards/api/handleBoardPageError";

const CreatePostEditor = dynamic(() => import('@/features/boards/components/CreatePostEditor'), {
    ssr: false,
})


export default async function WritePage({ params }: { params: { slug: string } }) {
    const baseUrl = getServerApiBaseUrl();
    const ssrAuth = getSsrUpstreamAuthFromRequest();
    let board;
    try {
        board = await fetchBoardWriteMetaBySegment(baseUrl, params.slug, ssrAuth);
    } catch (err) {
        handleBoardPageError(err, `/boards/${params.slug}/write`);
    }
    if (!board) return notFound();

    return (
        <div className="w-full px-0 py-6 sm:px-6 sm:max-w-[950px] sm:mx-auto">
            <h1 className="text-xl font-bold mb-4">글쓰기</h1>
            <CreatePostEditor boardSlug={params.slug} boardId={board.id} />
        </div>
    )
}
