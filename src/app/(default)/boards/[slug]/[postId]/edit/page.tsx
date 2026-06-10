import dynamic from "next/dynamic"
import { getServerApiBaseUrl, getSsrUpstreamAuthFromRequest } from "@/lib/api/serverBaseUrl"
import {
  fetchBoardMetaBySegment,
  fetchPostBySegment,
} from "@/features/boards/api/boardSvc"
import {
  handleProtectedPageError,
  redirectForbidden,
} from "@/lib/auth/handleProtectedPageError"

const EditPostEditor = dynamic(() => import("@/features/boards/components/EditPostEditor"), {
  ssr: false,
})

export default async function PostEditPage({
  params,
}: {
  params: { slug: string; postId: string }
}) {
  const baseUrl = getServerApiBaseUrl()
  const ssrAuth = getSsrUpstreamAuthFromRequest()

  let board
  let post
  try {
    board = await fetchBoardMetaBySegment(baseUrl, params.slug, ssrAuth)
    if (!board) redirectForbidden()
    post = await fetchPostBySegment(baseUrl, params.slug, params.postId, ssrAuth)
  } catch (err) {
    handleProtectedPageError(err, `/boards/${params.slug}/${params.postId}/edit`)
  }
  if (!post || post.boardId !== board.id) redirectForbidden()

  return (
    <div className="w-full px-0 py-6 sm:px-6 sm:max-w-[950px] sm:mx-auto">
      <h1 id="board-post-scroll-anchor" className="text-xl font-bold mb-4">글 수정</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        {board.name} · 글 #{post.id}
      </p>
      <EditPostEditor
        boardSlug={params.slug}
        boardId={board.id}
        postId={String(post.id)}
        initialTitle={post.title}
        initialContent={post.content}
      />
    </div>
  )
}
