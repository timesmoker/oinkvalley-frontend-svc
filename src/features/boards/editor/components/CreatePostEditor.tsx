'use client'

import PostEditor from "@/features/boards/editor/components/PostEditor";

export default function CreatePostEditor({
  boardSlug,
  boardId,
  boardName,
}: {
  boardSlug: string;
  boardId: number;
  boardName: string;
}) {
  return (
    <PostEditor
      mode="create"
      boardSlug={boardSlug}
      boardId={boardId}
      boardName={boardName}
    />
  );
}
