import { proseMirrorDetailsStyles } from "@/features/boards/lib/proseMirrorBoardStyles";
import {
    boardHeadingLevelSpacing,
    proseMirrorBeforeHeadingStyles,
    proseMirrorHeadingHrAdjacentStyles,
} from "@/features/boards/shared/layout/boardPostHeadingStyles";
import {
    boardHorizontalRuleAppearance,
    boardHorizontalRuleSpacing,
} from "@/features/boards/shared/layout/boardPostHorizontalRuleStyles";
import { boardPostProseMirrorContentPadding } from "@/features/boards/shared/layout/boardPostSurfaceStyles";

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
    "&& hr": {
        ...boardHorizontalRuleAppearance,
        ...boardHorizontalRuleSpacing,
    },
    "& li > p": {
        marginBlockEnd: "0.35em",
        marginLeft: "0 !important",
    },
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
        paddingLeft: "1.25rem",
        marginLeft: "0.5rem",
    },
    "& > ol:not([type])": {
        listStyleType: "decimal",
    },
    "& ol[type='a']": {
        listStyleType: "lower-alpha",
    },
    "& ol[type='i']": {
        listStyleType: "lower-roman",
    },
    "& ol[type='i'] > li::marker": {
        fontSize: "0.9em",
    },
    "& ul": {
        paddingLeft: "1.25rem",
        marginLeft: "0.5rem",
    },
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
