// src/types/board.ts
export type PostEntries = {
    id: number;
    title: string;
    userId: number;
    createdAt: string;
    commentCount: number;
    /** AI 가 쓴 글 */
    aiGenerated: boolean;
};