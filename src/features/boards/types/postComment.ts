import { JSONContent } from '@tiptap/core'

export type PostComment = {
    id: number;
    userId: number | null;
    postId: number;
    parentCommentId: number | null;
    parentUserId: number | null;
    rootCommentId: number;
    content: JSONContent;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
};

/** FE 표시용. API는 flat — UI만 root + 동일 depth 답글. */
export type CommentThread = {
    root: PostComment | null;
    replies: PostComment[];
};
