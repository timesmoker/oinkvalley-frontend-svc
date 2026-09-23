'use client'

import { useState } from "react";
import type { PostComment } from "@/features/boards/types/postComment";
import { authorLabel } from "@/features/profile/api/profileSvc";
import Viewer from "@/features/boards/viewer/components/Viewer";
import CommentEditor from "@/features/boards/comment/components/CommentEditor";
import { deleteComment } from "@/features/boards/api/boardMutations";
import { formatPostDateTime } from "@/features/boards/lib/formatPostDate";
import { showReplyTarget } from "@/features/boards/comment/lib/groupCommentsByRoot";

export default function CommentItem({
  comment,
  postId,
  isMine,
  isReply,
  nicknameByUserId,
  deleting,
  replyOpen,
  canReply,
  onReply,
  onReplyCancel,
  onDeleteStart,
  onDeleteDone,
  onRefresh,
}: {
  comment: PostComment;
  postId: string;
  isMine: boolean;
  /** UI depth: root 아래 동일 들여쓰기 */
  isReply: boolean;
  nicknameByUserId?: Record<string, string>;
  deleting: boolean;
  replyOpen: boolean;
  canReply: boolean;
  onReply: () => void;
  onReplyCancel: () => void;
  onDeleteStart: () => void;
  onDeleteDone: () => void;
  onRefresh?: () => void;
}) {
  const [editing, setEditing] = useState(false);

  const handleDelete = async () => {
    if (!confirm("이 댓글을 삭제할까요?")) return;
    onDeleteStart();
    try {
      await deleteComment(comment.id);
      onRefresh?.();
    } catch {
      alert("삭제할 수 없습니다.");
    } finally {
      onDeleteDone();
    }
  };

  const replyTargetLabel = (() => {
    if (!showReplyTarget(comment)) return null;
    if (comment.parentUserId == null) return "삭제된 댓글에 대한 답글";
    return `@${authorLabel(nicknameByUserId, comment.parentUserId)}에게 답글`;
  })();

  return (
    <li
      className={isReply ? "bg-gray-100 px-4 py-1 pl-10" : "px-4 py-1"}
    >
      <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
        <span className="truncate text-sm font-bold text-gray-900">
          {comment.deleted || comment.userId == null
            ? "삭제된 댓글"
            : authorLabel(nicknameByUserId, comment.userId)}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <span>{formatPostDateTime(comment.createdAt)}</span>
          {isMine && !comment.deleted && (
            <>
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  onReplyCancel();
                  setEditing((v) => !v);
                }}
                className="text-blue-600 hover:underline disabled:opacity-50"
              >
                {editing ? "닫기" : "수정"}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void handleDelete()}
                className="text-red-600 hover:underline disabled:opacity-50"
              >
                삭제
              </button>
            </>
          )}
        </span>
      </div>
      {comment.deleted ? (
        <p className="mt-1 text-xs text-gray-400 italic">삭제된 댓글입니다.</p>
      ) : editing ? (
        <div className="mt-1">
          <CommentEditor
            postId={postId}
            commentId={comment.id}
            initialContent={comment.content}
            onCancel={() => setEditing(false)}
            onSuccess={() => {
              setEditing(false);
              onRefresh?.();
            }}
          />
        </div>
      ) : (
        <div className="mt-1">
          {replyTargetLabel && (
            <p className="mb-0.5 text-xs text-gray-500">{replyTargetLabel}</p>
          )}
          <div
            className={
              "text-sm leading-snug " +
              "[&_.ProseMirror]:!min-h-0 [&_.ProseMirror]:!p-0 " +
              "[&_.ProseMirror_p]:!my-0 [&_.ProseMirror_p]:!leading-snug " +
              "[&_.ProseMirror_p+p]:!mt-1"
            }
          >
            <Viewer content={comment.content} />
          </div>
        </div>
      )}
      {!comment.deleted && !editing && (
        <div className="mt-0 flex justify-end leading-none">
          <button
            type="button"
            disabled={deleting || !canReply}
            onClick={onReply}
            className="text-xs text-gray-900 hover:underline disabled:opacity-40"
            title={canReply ? undefined : "로그인 후 답글 가능"}
          >
            {replyOpen ? "답글 닫기" : "답글"}
          </button>
        </div>
      )}
    </li>
  );
}
