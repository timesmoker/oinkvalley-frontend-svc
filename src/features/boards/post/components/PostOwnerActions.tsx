'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"
import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { deletePost } from "@/features/boards/api/boardMutations"

export default function PostOwnerActions({
  boardSlug,
  postId,
  authorUserId,
}: {
  boardSlug: string
  postId: string
  authorUserId: number
}) {
  const router = useRouter()
  const userId = useAuthStore((s) => s.userId)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)

  if (!hasHydrated || userId === null || userId !== authorUserId) {
    return null
  }

  const handleDelete = async () => {
    if (!confirm("이 글을 삭제할까요? 삭제하면 되돌릴 수 없습니다.")) return
    try {
      await deletePost(postId)
      router.push(`/boards/${boardSlug}`)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        if (status === 401) {
          alert("로그인이 필요합니다.")
        } else if (status === 403 || status === 404) {
          alert("삭제할 수 없습니다.")
        } else {
          alert("삭제 중 오류가 발생했습니다.")
        }
      } else {
        alert("알 수 없는 오류가 발생했습니다.")
      }
    }
  }

  return (
    <div className="mt-4 flex flex-wrap justify-end gap-2">
      <Link
        href={`/boards/${boardSlug}/${postId}/edit`}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
      >
        수정
      </Link>
      <button
        type="button"
        onClick={() => void handleDelete()}
        className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
      >
        삭제
      </button>
    </div>
  )
}
