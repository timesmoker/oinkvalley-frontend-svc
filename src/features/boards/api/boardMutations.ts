import type { JSONContent } from "@tiptap/core";
import apiClient from "@/lib/api/apiClient";

export async function createPost(input: {
  boardId: number;
  title: string;
  content: JSONContent;
}) {
  return apiClient.post("/posts", input);
}

export async function updatePost(
  postId: string,
  input: { title: string; content: JSONContent },
) {
  return apiClient.put(`/posts/${postId}`, input);
}

export async function deletePost(postId: string) {
  return apiClient.delete(`/posts/${postId}`);
}

export async function createComment(postId: string, input: { content: JSONContent }) {
  return apiClient.post("/comments", input, { params: { postId } });
}

export async function updateComment(commentId: number, input: { content: JSONContent }) {
  return apiClient.put(`/comments/${commentId}`, input);
}

export async function deleteComment(commentId: number) {
  return apiClient.delete(`/comments/${commentId}`);
}
