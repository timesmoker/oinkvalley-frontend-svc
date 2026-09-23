'use client'

import { useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { useComments } from "@/features/boards/comment/hooks/useComments"
import CommentItem from "@/features/boards/comment/components/CommentItem"
import CommentEditor from "@/features/boards/comment/components/CommentEditor"
import {
    groupCommentsByRoot,
    type CommentThreadSort,
} from "@/features/boards/comment/lib/groupCommentsByRoot"
import { authorLabel } from "@/features/profile/api/profileSvc"
import type { PostComment } from "@/features/boards/types/postComment"

const REPLY_PREVIEW_COUNT = 3

export default function CommentList({
    postId,
    refreshKey,
    onRefresh,
}: {
    postId: string
    refreshKey?: number
    /** 목록 다시 불러오기(삭제·수정 후) */
    onRefresh?: () => void
}) {
    const [page, setPage] = useState(0)
    const [sort, setSort] = useState<CommentThreadSort>("newest")
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [replyToId, setReplyToId] = useState<number | null>(null)
    const [expandedRootIds, setExpandedRootIds] = useState<Set<number>>(() => new Set())

    const userId = useAuthStore((s) => s.userId)
    const hasHydrated = useAuthStore((s) => s.hasHydrated)
    const {
        comments,
        listSort,
        nicknameByUserId,
        totalPages,
        totalComments,
        authRequired,
        memberRequired,
        accessMessage,
    } = useComments(postId, page, sort, refreshKey)

    const threads = useMemo(
        () => groupCommentsByRoot(comments, listSort),
        [comments, listSort],
    )

    const canReply = Boolean(hasHydrated && userId !== null)

    const replyLabelFor = (comment: PostComment) => {
        if (comment.deleted || comment.userId == null) return "삭제된 댓글에 대한 답글"
        return `@${authorLabel(nicknameByUserId, comment.userId)}에게 답글`
    }

    const renderItem = (comment: PostComment, isReply: boolean) => {
        const items: ReactNode[] = [
            <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                isReply={isReply}
                nicknameByUserId={nicknameByUserId}
                isMine={Boolean(
                    hasHydrated &&
                        userId !== null &&
                        comment.userId !== null &&
                        Number(comment.userId) === Number(userId),
                )}
                canReply={canReply}
                replyOpen={replyToId === comment.id}
                onReply={() => setReplyToId((id) => (id === comment.id ? null : comment.id))}
                onReplyCancel={() => setReplyToId(null)}
                deleting={deletingId === comment.id}
                onDeleteStart={() => setDeletingId(comment.id)}
                onDeleteDone={() => setDeletingId(null)}
                onRefresh={onRefresh}
            />,
        ]

        if (replyToId === comment.id && !comment.deleted) {
            items.push(
                <li
                    key={`reply-form-${comment.id}`}
                    className="bg-gray-100 px-4 py-2 pl-10"
                >
                    <CommentEditor
                        postId={postId}
                        parentCommentId={comment.id}
                        replyLabel={replyLabelFor(comment)}
                        onCancel={() => setReplyToId(null)}
                        onSuccess={() => {
                            setReplyToId(null)
                            onRefresh?.()
                        }}
                    />
                </li>,
            )
        }

        return items
    }

    return (
        <div className="mt-3 w-full mx-auto">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">
                    댓글 {authRequired || memberRequired ? 0 : totalComments}
                </h2>
                {!authRequired && !memberRequired && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                        <button
                            type="button"
                            onClick={() => {
                                if (sort === "newest") return
                                setSort("newest")
                                setPage(0)
                                setExpandedRootIds(new Set())
                            }}
                            className={
                                sort === "newest"
                                    ? "font-bold text-gray-900"
                                    : "hover:text-gray-800"
                            }
                        >
                            최신순
                        </button>
                        <span aria-hidden>|</span>
                        <button
                            type="button"
                            onClick={() => {
                                if (sort === "oldest") return
                                setSort("oldest")
                                setPage(0)
                                setExpandedRootIds(new Set())
                            }}
                            className={
                                sort === "oldest"
                                    ? "font-bold text-gray-900"
                                    : "hover:text-gray-800"
                            }
                        >
                            오래된순
                        </button>
                    </div>
                )}
            </div>

            {authRequired && (
                <p className="text-sm text-muted-foreground mb-4 rounded-md border border-dashed px-3 py-2">
                    {accessMessage ?? "로그인이 필요합니다."}{" "}
                    <Link href="/login" className="text-blue-600 underline hover:text-blue-500">
                        로그인
                    </Link>
                </p>
            )}

            {memberRequired && (
                <p className="text-sm text-muted-foreground mb-4 rounded-md border border-dashed px-3 py-2">
                    {accessMessage ?? "정식 회원만 열람할 수 있습니다."}
                </p>
            )}

            {!authRequired && !memberRequired && (
                <>
                    <ul className="divide-y divide-gray-200 border-y border-gray-200">
                        {threads.flatMap((thread) => {
                            const items: ReactNode[] = []
                            const rootId = thread.root?.id ?? thread.replies[0]?.rootCommentId
                            if (thread.root) items.push(...renderItem(thread.root, false))

                            const expanded =
                                rootId != null && expandedRootIds.has(rootId)
                            const visibleReplies =
                                expanded || thread.replies.length <= REPLY_PREVIEW_COUNT
                                    ? thread.replies
                                    : thread.replies.slice(0, REPLY_PREVIEW_COUNT)

                            for (const reply of visibleReplies) {
                                items.push(...renderItem(reply, true))
                            }

                            if (
                                rootId != null &&
                                !expanded &&
                                thread.replies.length > REPLY_PREVIEW_COUNT
                            ) {
                                const hidden = thread.replies.length - REPLY_PREVIEW_COUNT
                                items.push(
                                    <li
                                        key={`more-replies-${rootId}`}
                                        className="bg-gray-100 px-4 py-1.5 pl-10"
                                    >
                                        <button
                                            type="button"
                                            className="text-xs text-gray-700 hover:underline"
                                            onClick={() =>
                                                setExpandedRootIds((prev) => {
                                                    const next = new Set(prev)
                                                    next.add(rootId)
                                                    return next
                                                })
                                            }
                                        >
                                            답글 전체 더보기 ({hidden}개)
                                        </button>
                                    </li>,
                                )
                            }

                            return items
                        })}
                    </ul>

                    <div className="mt-3 flex items-center justify-between">
                        <button
                            disabled={page <= 0}
                            onClick={() => {
                                setPage((p) => Math.max(p - 1, 0))
                                setExpandedRootIds(new Set())
                            }}
                            className="text-sm hover:underline disabled:opacity-40"
                        >
                            이전
                        </button>
                        <span className="text-sm text-muted-foreground">
                            {page + 1} / {Math.max(totalPages, 1)}
                        </span>
                        <button
                            disabled={page >= totalPages - 1 || totalPages <= 0}
                            onClick={() => {
                                setPage((p) => Math.min(p + 1, totalPages - 1))
                                setExpandedRootIds(new Set())
                            }}
                            className="text-sm hover:underline disabled:opacity-40"
                        >
                            다음
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
