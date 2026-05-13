'use client'

import PostEditor from "@/features/boards/components/PostEditor";

export default function CreatePostEditor({
  boardSlug,
  boardId,
}: {
  boardSlug: string;
  boardId: number;
}) {
  return <PostEditor mode="create" boardSlug={boardSlug} boardId={boardId} />;
}
