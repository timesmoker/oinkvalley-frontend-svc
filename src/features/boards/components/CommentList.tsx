'use client'

import { useState } from "react"
import Link from "next/link"
import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { useComments } from "@/features/boards/hooks/useComments"
import CommentItem from "@/features/boards/components/CommentItem"

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
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const userId = useAuthStore((s) => s.userId)
    const hasHydrated = useAuthStore((s) => s.hasHydrated)
    const { comments, nicknameByUserId, totalPages, authRequired } = useComments(postId, page, refreshKey)

    return (
        <div className="mt-6 w-full mx-auto">
            <h2 className="text-lg font-semibold mb-4">댓글 {authRequired ? 0 : comments.length}</h2>

            {authRequired && (
                <p className="text-sm text-muted-foreground mb-4 rounded-md border border-dashed px-3 py-2">
                    댓글을 보려면 로그인이 필요합니다.{' '}
                    <Link href="/login" className="text-blue-600 underline hover:text-blue-500">
                        로그인
                    </Link>
                </p>
            )}

            {!authRequired && (
                <>
                    <ul className="space-y-4">
                        {comments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                postId={postId}
                                nicknameByUserId={nicknameByUserId}
                                isMine={Boolean(hasHydrated && userId !== null && comment.userId === userId)}
                                deleting={deletingId === comment.id}
                                onDeleteStart={() => setDeletingId(comment.id)}
                                onDeleteDone={() => setDeletingId(null)}
                                onRefresh={onRefresh}
                            />
                        ))}
                    </ul>

                    <div className="flex justify-between items-center mt-6">
                        <button
                            disabled={page <= 0}
                            onClick={() => setPage((p) => Math.max(p - 1, 0))}
                            className="text-sm hover:underline disabled:opacity-40"
                        >
                            이전
                        </button>
                        <span className="text-sm text-muted-foreground">
                            {page + 1} / {totalPages}
                        </span>
                        <button
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
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
