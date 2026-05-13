import { JSONContent } from '@tiptap/core'

export type PostComment = {
    id: number;
    userId: number;
    postId: number;
    content: JSONContent;
    createdAt: string;
    updatedAt: string;
};