import { proseMirrorDetailsStyles } from "@/features/boards/lib/proseMirrorBoardStyles";

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

/** 본문 heading — 위 여백 없음, 아래만 level별 (간격은 앞 블록 marginEnd로) */
export const boardHeadingLevelSpacing = {
    1: { lineHeight: "1.3em", marginBlockEnd: "0.85em" },
    2: { lineHeight: "1.32em", marginBlockEnd: "0.725em" },
    3: { lineHeight: "1.35em", marginBlockEnd: "0.65em" },
    4: { lineHeight: "1.35em", marginBlockEnd: "0.4375em" },
    5: { lineHeight: "1.4em", marginBlockEnd: "0.375em" },
    6: { lineHeight: "1.4em", marginBlockEnd: "0.3125em" },
} as const;

export const BOARD_POST_HEADING_CLASS = "board-post-heading";
export const BOARD_POST_HR_CLASS = "board-post-hr";

const boardHeadingTags = "h1, h2, h3, h4, h5, h6";

/** 헤딩 바로 위 — 앞 블록 아래 margin 축소 (헤딩 자체 margin-top은 0) */
export const proseMirrorBeforeHeadingStyles = {
    [`&& p:has(+ ${boardHeadingTags}), && blockquote:has(+ ${boardHeadingTags})`]: {
        marginBlockEnd: "0.25em !important",
    },
    [`&& hr:has(+ ${boardHeadingTags})`]: {
        marginBlockEnd: "0.25em !important",
    },
} as const;

/** heading ↔ hr 인접 시 margin 겹침·과한 공백 방지 */
export const proseMirrorHeadingHrAdjacentStyles = {
    [`&& ${boardHeadingTags}:has(+ hr)`]: {
        marginBlockEnd: "0.25em !important",
    },
    [`&& ${boardHeadingTags} + hr`]: {
        marginBlockStart: "0.375em !important",
    },
} as const;

export function getBoardHeadingSpacing(level: number) {
    const clamped = Math.min(Math.max(level, 1), 6) as keyof typeof boardHeadingLevelSpacing;
    return boardHeadingLevelSpacing[clamped];
}

/** 게시글 본문 ProseMirror 안쪽 여백 — 좌측은 에디터 드래그 핸들 영역과 맞춤 */
export const boardPostProseMirrorContentPadding = {
    paddingTop: "1rem",
    paddingRight: "1rem",
    paddingBottom: "1rem",
    paddingLeft: "2.25rem",
} as const;

/** Viewer — 작성자 줄 아래·본문 영역 상단 (살짝만) */
export const boardPostViewerContentPaddingTop = "0.75rem";

const boardPostProseMirrorFirstHeadingChildSelector =
    "> h1:first-child, > h2:first-child, > h3:first-child, > h4:first-child, > h5:first-child, > h6:first-child";

/**
 * Viewer 본문 래퍼 (게시글 상세).
 * 첫 블록이 heading이면 래퍼 padding만 쓰고 ProseMirror paddingTop은 0 — 이중 여백 방지.
 */
export const boardPostViewerBodySx = {
    paddingTop: boardPostViewerContentPaddingTop,
    [`& .ProseMirror:has(${boardPostProseMirrorFirstHeadingChildSelector})`]: {
        paddingTop: 0,
    },
} as const;

/** 좌우 padding 차이만큼 hr을 왼쪽으로 — 상자 기준 시각적 가운데 */
const boardHorizontalRuleCenterOffset = `calc((${boardPostProseMirrorContentPadding.paddingRight} - ${boardPostProseMirrorContentPadding.paddingLeft}) / 2)`;

/** HorizontalRule(구분선) 위·아래 여백 — mui-tiptap margin 리셋을 인라인으로 이김 */
export const boardHorizontalRuleSpacing = {
    marginBlockStart: "1.8em",
    marginBlockEnd: "1.8em",
} as const;

/**
 * - appearance: `&& hr` CSS (저장된 글·폴백)
 * - inlineStyle: 새로 삽입하는 `<hr>` (mui margin 리셋 이김)
 */
export const boardHorizontalRuleLayout = {
    width: "95%",
    opacity: 0.2,
    borderTopWidth: "2px",
} as const;

export const boardHorizontalRuleAppearance = {
    display: "block",
    width: boardHorizontalRuleLayout.width,
    marginLeft: "auto",
    marginRight: "auto",
    transform: `translateX(${boardHorizontalRuleCenterOffset})`,
    opacity: boardHorizontalRuleLayout.opacity,
    border: "none",
    borderTop: `${boardHorizontalRuleLayout.borderTopWidth} solid`,
    borderColor: "currentColor",
} as const;

export const boardHorizontalRuleInlineStyle = [
    "display: block",
    `width: ${boardHorizontalRuleLayout.width}`,
    "margin-left: auto",
    "margin-right: auto",
    `transform: translateX(${boardHorizontalRuleCenterOffset})`,
    `opacity: ${boardHorizontalRuleLayout.opacity}`,
    "border: none",
    `border-top: ${boardHorizontalRuleLayout.borderTopWidth} solid currentColor`,
    `margin-block-start: ${boardHorizontalRuleSpacing.marginBlockStart}`,
    `margin-block-end: ${boardHorizontalRuleSpacing.marginBlockEnd}`,
].join("; ");

/**
 * mui-tiptap getEditorStyles가 p/h1~h6 margin을 0으로 리셋함.
 * 게시글 heading(NodeView)은 HeadingWithAnchorTocComponent 인라인 스타일로 여백 적용.
 * 댓글 등 일반 heading은 `&&` CSS로 margin 리셋을 이김.
 */
export const proseMirrorBlockSpacingStyles = {
    "&& p": {
        lineHeight: "1.7em",
        marginBlockStart: 0,
        marginBlockEnd: "0.75em",
        "&&:last-child": {
            marginBlockEnd: 0,
        },
    },
    "&& h1": { marginBlockStart: 0, ...boardHeadingLevelSpacing[1] },
    "&& h2": { marginBlockStart: 0, ...boardHeadingLevelSpacing[2] },
    "&& h3": { marginBlockStart: 0, ...boardHeadingLevelSpacing[3] },
    "&& h4": { marginBlockStart: 0, ...boardHeadingLevelSpacing[4] },
    "&& h5": { marginBlockStart: 0, ...boardHeadingLevelSpacing[5] },
    "&& h6": { marginBlockStart: 0, ...boardHeadingLevelSpacing[6] },
    "& blockquote": {
        marginBlock: "0.75em",
    },
    /* HorizontalRule — 여백은 extension HTMLAttributes 인라인 스타일 (댓글 등 폴백) */
    "&& hr": {
        ...boardHorizontalRuleAppearance,
        ...boardHorizontalRuleSpacing,
    },
    "& li > p": {
        marginBlockEnd: "0.35em",
    },
    /* FontSize 확장 — span[style] 인라인 글자 크기 줄박스 */
    "& [style*='font-size']": {
        lineHeight: "1.7em",
    },
} as const;

/** 게시글 본문 ProseMirror 공통 스타일 */
export const boardPostProseMirrorSx = {
    ...boardPostProseMirrorContentPadding,
    overflowWrap: "break-word",
    wordBreak: "break-word",
    ...proseMirrorBlockSpacingStyles,
    ...proseMirrorBeforeHeadingStyles,
    ...proseMirrorHeadingHrAdjacentStyles,
    "& ol": {
        paddingLeft: "1.5rem",
        marginLeft: 0,
    },
    /* 단독 목록 타입(type attr) — 1. -> a. -> i. */
    "& ol:not([type])": {
        listStyleType: "decimal",
    },
    "& ol[type='a']": {
        listStyleType: "lower-alpha",
    },
    "& ol[type='i']": {
        listStyleType: "lower-roman",
    },
    /* sink된 중첩 목록 fallback */
    "& ol ol": {
        listStyleType: "lower-alpha",
    },
    "& ol ol ol": {
        listStyleType: "lower-roman",
    },
    "& ol ol ol ol": {
        listStyleType: "decimal",
    },
    "& ul": {
        paddingLeft: "1.5rem",
        marginLeft: 0,
    },
    ...proseMirrorDetailsStyles,
} as const;
