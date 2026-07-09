/** 게시글 max-width (page.tsx write/edit/detail 와 동일) */
export const BOARD_POST_CONTENT_MAX_WIDTH_PX = 950;

/** 우측 고정 목차 폭 */
export const BOARD_POST_TOC_RAIL_WIDTH_PX = 200;

/**
 * 목차 — 본문 상자 밖 오른쪽 고정.
 * xl 미만(모바일·세로 긴 좁은 화면)에서는 숨김.
 */
export const BOARD_POST_TOC_FIXED_SX = {
    display: { xs: "none", xl: "block" },
    position: "fixed" as const,
    top: 24,
    left: `calc((100vw + ${BOARD_POST_CONTENT_MAX_WIDTH_PX}px) / 2 + 1rem)`,
    width: BOARD_POST_TOC_RAIL_WIDTH_PX,
    maxWidth: BOARD_POST_TOC_RAIL_WIDTH_PX,
    zIndex: 10,
    py: 1,
    px: 0.5,
} as const;

