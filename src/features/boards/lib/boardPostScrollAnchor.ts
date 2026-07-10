/** 게시글·글쓰기 페이지 상단 제목 — 목차 클릭 시 헤딩이 여기 높이에 오도록 */
export const BOARD_POST_SCROLL_ANCHOR_ID = "board-post-scroll-anchor";
/** 목차 레일 top 정렬 기준 — 에디터/뷰어 문서 박스 최상단 */
export const BOARD_POST_DOCUMENT_SHELL_ID = "board-post-document-shell";

/** 페이지 제목(게시판 이름 등)이 처음 로드됐을 때의 뷰포트 Y — 문서 Y와 동일(scroll 0 기준) */
export function measureBoardPostScrollOffset(): number {
    const anchor = document.getElementById(BOARD_POST_SCROLL_ANCHOR_ID);
    if (!anchor) return 0;
    const rect = anchor.getBoundingClientRect();
    return Math.round(rect.top + window.scrollY);
}

/** 목차 클릭 시 헤딩으로 이동할 문서 Y 좌표 계산 */
export function getBoardPostHeadingScrollTop(target: HTMLElement): number {
    const anchorOffset = measureBoardPostScrollOffset();
    return Math.round(target.getBoundingClientRect().top + window.scrollY - anchorOffset);
}
