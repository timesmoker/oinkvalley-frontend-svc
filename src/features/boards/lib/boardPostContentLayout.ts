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

/** 제목·메타·본문 한 컬럼 — 상단 여백만 (좌우는 블록별로 prose 와 맞춤) */
export const boardPostArticleColumnClassName = "w-full min-w-0 pt-12 pb-4";

/** 제목 블록 — 본문 첫 줄과 같은 좌우 여백 */
export const boardPostTitleBlockClassName =
    "w-full min-w-0 pl-[2.25rem] pr-4 pb-3";

/** 페이지 제목 40px (뷰어 h1 · 에디터 input) */
export const boardPostTitleClassName =
    "w-full min-w-0 bg-transparent outline-none text-[40px] font-bold leading-[1.2] tracking-tight text-gray-900 placeholder:text-gray-300 placeholder:font-bold";

/** 제목 아래 작성자·작성시각 — 우측 정렬 */
export const boardPostMetaRowClassName =
    "flex justify-end items-center flex-wrap gap-x-3 gap-y-1 pl-[2.25rem] pr-4 pb-5 text-[0.8125rem] text-gray-500";

/** 게시글 문서 외곽 (에디터·뷰어) */
export const boardPostDocumentShellClassName =
    "border border-gray-200 rounded-md overflow-hidden bg-white";

/** Viewer — 제목·메타가 같은 컬럼일 때 본문 상단 padding 제거 */
export const boardPostViewerContentPaddingTop = 0;

/** 게시글 본문 ProseMirror — 제목 아래 이어질 때 상단 padding 없음 */
export const boardPostArticleProsePaddingTop = 0;

/**
 * 글쓰기/수정 — 제목과 한 문서처럼 보이게 RichTextField(standard) 흔적 제거.
 * - FieldContainer notchedOutline(테두리·hover·focus 링) 제거
 * - content padding 0 → ProseMirror 자체 padding 만 사용 (제목 좌측선과 일치)
 */
export const boardPostEditorRichTextFieldSx = {
    paddingTop: 0,
    "& .MuiTiptap-RichTextField-root": {
        borderRadius: 0,
        marginTop: 0,
    },
    /* 본문 콘텐츠만 — 메뉴바(.menuBarContent에도 content 클래스 붙음)는 유지 */
    "& .MuiTiptap-RichTextContent-root": {
        padding: "0 !important",
    },
    "& .MuiTiptap-FieldContainer-notchedOutline": {
        border: "none !important",
    },
    "& .MuiOutlinedInput-notchedOutline": {
        border: "none !important",
    },
} as const;

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
    /* 최상위만 1. — 중첩 ol은 아래 ol ol 규칙 (ol:not([type])가 ol ol 보다 specificity 높아 덮지 않도록 > 사용) */
    "& > ol:not([type])": {
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
    /* 이미지 — wrapper text-align (에디터 NodeView · 뷰어 renderHTML 동일). mui-tiptap inline-flex 덮음 */
    "& [data-board-image]": {
        width: "100%",
    },
    "&& [data-board-image] img:not(.ProseMirror-separator)": {
        display: "inline-block",
        maxWidth: "100%",
        height: "auto",
        verticalAlign: "top",
    },
    ...proseMirrorDetailsStyles,
} as const;
