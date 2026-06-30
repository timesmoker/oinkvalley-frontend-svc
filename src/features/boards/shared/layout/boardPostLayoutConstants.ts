/** 게시글 max-width (page.tsx write/edit/detail 와 동일) */
export const BOARD_POST_CONTENT_MAX_WIDTH_PX = 950;

/** 우측 고정 목차 폭 */
export const BOARD_POST_TOC_RAIL_WIDTH_PX = 200;

/** 본문 상단 인라인 목차 최대 폭 */
export const BOARD_POST_TOC_INLINE_MAX_WIDTH_PX = 480;

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

/** Viewer 본문 상단 인라인 목차 래퍼 (xl 미만) — 가운데 정렬 */
export const BOARD_POST_TOC_INLINE_WRAP_SX = {
    display: { xs: "flex", xl: "none" },
    justifyContent: "center",
    mb: 2,
    width: "100%",
} as const;

/** Viewer 본문 상단 인라인 목차 (xl 미만) */
export const BOARD_POST_TOC_INLINE_SX = {
    p: 1.5,
    width: "100%",
    maxWidth: BOARD_POST_TOC_INLINE_MAX_WIDTH_PX,
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 1,
    backgroundColor: "grey.50",
    fontSize: "0.875rem",
} as const;
