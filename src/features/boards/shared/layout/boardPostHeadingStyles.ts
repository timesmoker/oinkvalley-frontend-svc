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
