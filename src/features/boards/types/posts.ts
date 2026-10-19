// src/types/posts.ts
import { JSONContent } from '@tiptap/core'
export type PostDetail = {
    id: number;
    userId: number;
    boardId: number;
    title: string;
    content: JSONContent;
    createdAt: string;
    updatedAt: string;
    /** AI 가 쓴 글 */
    aiGenerated: boolean;
};