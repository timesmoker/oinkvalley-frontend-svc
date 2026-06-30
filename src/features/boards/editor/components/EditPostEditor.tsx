'use client'

import type { JSONContent } from "@tiptap/core";
import PostEditor from "@/features/boards/editor/components/PostEditor";

export default function EditPostEditor({
  boardSlug,
  boardId,
  boardName,
  postId,
  initialTitle,
  initialContent,
}: {
  boardSlug: string;
  boardId: number;
  boardName: string;
  postId: string;
  initialTitle: string;
  initialContent: JSONContent;
}) {
  return (
    <PostEditor
      mode="edit"
      boardSlug={boardSlug}
      boardId={boardId}
      boardName={boardName}
      postId={postId}
      initialTitle={initialTitle}
      initialContent={initialContent}
    />
  );
}
