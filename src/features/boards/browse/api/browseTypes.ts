/** search-svc 둘러보기 글 한 줄 — `GET /browse/{key}/posts`, `GET /browse/posts?ids=` 공통 */
export type BrowsePost = {
    id: number;
    boardSlug: string;
    boardName: string;
    title: string;
    commentCount: number;
    authorUserId: number;
    createdAt: string;
};

export type BrowsePage = {
    posts: BrowsePost[];
    /** 1부터 */
    page: number;
    totalPages: number;
    /** 전체 개수가 상한(maxTotalHits)에 걸림 — totalPages 너머에도 글이 있다 */
    capped: boolean;
};
