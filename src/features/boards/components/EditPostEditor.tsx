'use client'

import type { JSONContent } from "@tiptap/core";
import PostEditor from "@/features/boards/components/PostEditor";

export default function EditPostEditor({
  boardSlug,
  boardId,
  postId,
  initialTitle,
  initialContent,
}: {
  boardSlug: string;
  boardId: number;
  postId: string;
  initialTitle: string;
  initialContent: JSONContent;
}) {
  return (
    <PostEditor
      mode="edit"
      boardSlug={boardSlug}
      boardId={boardId}
      postId={postId}
      initialTitle={initialTitle}
      initialContent={initialContent}
    />
  );
}
