import type { CommentThread, PostComment } from "@/features/boards/types/postComment";

export type CommentThreadSort = "newest" | "oldest";

/**
 * flat 댓글 → UI 스레드.
 * recursive children 없음. rootCommentId 로만 그룹.
 * 답글은 항상 createdAt ASC (대화 순서).
 */
export function groupCommentsByRoot(
  comments: PostComment[],
  threadSort: CommentThreadSort = "oldest",
): CommentThread[] {
  const byRoot = new Map<number, { root: PostComment | null; replies: PostComment[] }>();

  for (const comment of comments) {
    const rootId = comment.rootCommentId;
    let bucket = byRoot.get(rootId);
    if (!bucket) {
      bucket = { root: null, replies: [] };
      byRoot.set(rootId, bucket);
    }
    if (comment.parentCommentId == null) {
      bucket.root = comment;
    } else {
      bucket.replies.push(comment);
    }
  }

  const threads: CommentThread[] = [];
  for (const bucket of byRoot.values()) {
    bucket.replies.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    threads.push({ root: bucket.root, replies: bucket.replies });
  }

  threads.sort((a, b) => {
    const aAt = a.root?.createdAt ?? a.replies[0]?.createdAt ?? "";
    const bAt = b.root?.createdAt ?? b.replies[0]?.createdAt ?? "";
    const diff = new Date(aAt).getTime() - new Date(bAt).getTime();
    return threadSort === "newest" ? -diff : diff;
  });

  return threads;
}

export function showReplyTarget(comment: PostComment): boolean {
  return (
    comment.parentCommentId != null &&
    comment.parentCommentId !== comment.rootCommentId
  );
}

/** Spring Pageable sort 쿼리 */
export function commentSortParam(threadSort: CommentThreadSort): string {
  return threadSort === "newest" ? "createdAt,desc" : "createdAt,asc";
}
