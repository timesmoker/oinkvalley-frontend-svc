import { authorLabel } from "@/features/profile/api/profileSvc";
import PostTable, { PostListPagination } from "@/features/boards/shared/components/PostTable";
import type { BrowsePage } from "@/features/boards/browse/api/browseTypes";
import { browseHref, type BrowseKey } from "@/features/boards/browse/lib/browseDefinitions";

/** 게시판 글 목록과 같은 표 + 게시판 열. 글 링크는 원래 게시판 주소 + 출처(from) 쿼리. */
export default function BrowsePostList({
    data,
    browseKey,
    nicknameByUserId,
}: {
    data: BrowsePage;
    browseKey: BrowseKey;
    nicknameByUserId?: Record<string, string>;
}) {
    if (data.posts.length === 0) {
        return <p className="py-12 text-center text-sm text-muted-foreground">볼 수 있는 글이 아직 없어요.</p>;
    }

    const fromQuery = `?from=${browseKey}${data.page > 1 ? `&page=${data.page}` : ""}`;

    return (
        <>
            <PostTable
                showBoard
                rows={data.posts.map((post) => ({
                    id: post.id,
                    href: `/boards/${post.boardSlug}/${post.id}${fromQuery}`,
                    title: post.title,
                    commentCount: post.commentCount,
                    aiGenerated: post.aiGenerated,
                    authorName: authorLabel(nicknameByUserId, post.authorUserId),
                    createdAt: post.createdAt,
                    boardName: post.boardName,
                    boardHref: `/boards/${post.boardSlug}`,
                }))}
            />
            <PostListPagination
                page={data.page}
                totalPages={data.totalPages}
                capped={data.capped}
                hrefForPage={(p) => browseHref(browseKey, p)}
            />
        </>
    );
}
