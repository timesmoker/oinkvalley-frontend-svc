/** 게시글·글쓰기 페이지 상단 제목 — 목차 클릭 시 헤딩이 여기 높이에 오도록 */
export const BOARD_POST_SCROLL_ANCHOR_ID = "board-post-scroll-anchor";

/** 페이지 제목(게시판 이름 등)이 처음 로드됐을 때의 뷰포트 Y — 문서 Y와 동일(scroll 0 기준) */
export function measureBoardPostScrollOffset(): number {
    const anchor = document.getElementById(BOARD_POST_SCROLL_ANCHOR_ID);
    if (!anchor) return 0;
    const rect = anchor.getBoundingClientRect();
    return Math.round(rect.top + window.scrollY);
}
