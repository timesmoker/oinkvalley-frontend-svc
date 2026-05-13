'use client'

import { useState } from "react";
import type { PostComment } from "@/features/boards/types/postComment";
import { authorLabel } from "@/features/profile/api/profileSvc";
import Viewer from "@/features/boards/components/Viewer";
import CommentEditor from "@/features/boards/components/CommentEditor";
import { deleteComment } from "@/features/boards/api/boardMutations";

export default function CommentItem({
  comment,
  postId,
  isMine,
  nicknameByUserId,
  deleting,
  onDeleteStart,
  onDeleteDone,
  onRefresh,
}: {
  comment: PostComment;
  postId: string;
  isMine: boolean;
  nicknameByUserId?: Record<string, string>;
  deleting: boolean;
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

  return (
    <li className="border rounded-md p-3 bg-gray-50 shadow-sm">
      <div className="flex justify-between gap-2 text-sm text-gray-500 mb-2">
        <span>{authorLabel(nicknameByUserId, comment.userId)}</span>
        <span className="flex shrink-0 items-center gap-2">
          <span>{new Date(comment.createdAt).toLocaleString()}</span>
          {isMine && (
            <>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setEditing((v) => !v)}
                className="text-blue-600 hover:underline disabled:opacity-50"
              >
                {editing ? "편집 닫기" : "수정"}
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
      <div className="text-sm leading-normal min-h-[25px]">
        {editing ? (
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
        ) : (
          <Viewer content={comment.content} />
        )}
      </div>
    </li>
  );
}
