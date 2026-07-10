import { boardPostProseMirrorContentPadding } from "@/features/boards/shared/layout/boardPostSurfaceStyles";

export const BOARD_POST_HR_CLASS = "board-post-hr";

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
