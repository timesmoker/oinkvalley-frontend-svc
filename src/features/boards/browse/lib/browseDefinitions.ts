export type BrowseKey = "all";

/** 둘러보기 종류 — key 는 search-svc browse.Definitions 와 맞춘다. 게시판 목록 카드·헤더 메뉴도 이 목록으로 그린다. */
export const BROWSE_DEFINITIONS: Record<BrowseKey, { title: string; description: string }> = {
    all: { title: "전체 게시글", description: "오잉크밸리에 올라온 모든 글" },
};

/** 둘러보기 목록 주소. page 는 1부터 (1이면 생략). */
export function browseHref(key: BrowseKey, page = 1): string {
    return page > 1 ? `/browse/${key}?page=${page}` : `/browse/${key}`;
}

export function isBrowseKey(key: string): key is BrowseKey {
    return Object.prototype.hasOwnProperty.call(BROWSE_DEFINITIONS, key);
}
