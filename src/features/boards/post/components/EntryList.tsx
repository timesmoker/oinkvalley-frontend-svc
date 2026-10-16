// src/components/boards/ui/EntryList.tsx

import { PostEntries } from "@/features/boards/types/postEntries";
import { authorLabel } from "@/features/profile/api/profileSvc";
import PostTable, { PostListPagination } from "@/features/boards/post/components/PostTable";

export default function EntryList({
    posts,
    boardSlug,
    page,
    totalPages,
    nicknameByUserId,
}: {
    posts: PostEntries[];
    /** URL 세그먼트 (`/boards/{boardSlug}/…`) — API의 `BoardResponse.slug`와 동일 */
    boardSlug: string;
    page: number;
    totalPages: number;
    nicknameByUserId?: Record<string, string>;
}) {
    const baseHref = `/boards/${boardSlug}`;

    return (
        <>
            <PostTable
                rows={posts.map((entry) => ({
                    id: entry.id,
                    href: `${baseHref}/${entry.id}`,
                    title: entry.title,
                    commentCount: entry.commentCount,
                    authorName: authorLabel(nicknameByUserId, entry.userId),
                    createdAt: entry.createdAt,
                }))}
            />
            {/* 게시판 목록 page 쿼리는 0부터 시작 */}
            <PostListPagination
                page={page + 1}
                totalPages={totalPages}
                hrefForPage={(p) => (p === 1 ? baseHref : `${baseHref}?page=${p - 1}`)}
            />
        </>
    );
}
