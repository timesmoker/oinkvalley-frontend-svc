import { BOARD_EDITOR_MENU_BAR_STICKY_OFFSET_PX } from "@/features/boards/lib/boardEditorMenuBarSticky";
import { BOARD_POST_CONTENT_MAX_WIDTH_PX } from "@/features/boards/lib/boardPostContentLayout";

/** 이 너비 미만이면 상단 가로 툴바 (모바일·좁은 화면) */
export const BOARD_EDITOR_COMPACT_TOOLBAR_BREAKPOINT = "md" as const;

/** 좌측 세로 툴바 폭 — Font·para 라벨이 잘리지 않도록 */
export const BOARD_EDITOR_SIDE_TOOLBAR_WIDTH_PX = 56;

/** 본문 컬럼과 간격 — 우측 목차(BOARD_POST_TOC_FIXED_SX)와 동일 */
export const BOARD_EDITOR_SIDE_TOOLBAR_GAP = "1rem";

/**
 * 좌측 고정 툴바 — 950px 본문 박스 왼쪽 밖 (우측 목차와 대칭).
 * top 은 editorBodyRef 측정값(박스 상단)으로 덮어씀.
 */
export const BOARD_EDITOR_SIDE_TOOLBAR_FIXED_SX = {
    display: { xs: "none", md: "flex" },
    flexDirection: "column",
    position: "fixed" as const,
    top: BOARD_EDITOR_MENU_BAR_STICKY_OFFSET_PX,
    left: `max(0.5rem, calc((100vw - ${BOARD_POST_CONTENT_MAX_WIDTH_PX}px) / 2 - ${BOARD_EDITOR_SIDE_TOOLBAR_WIDTH_PX}px - ${BOARD_EDITOR_SIDE_TOOLBAR_GAP}))`,
    width: BOARD_EDITOR_SIDE_TOOLBAR_WIDTH_PX,
    maxWidth: BOARD_EDITOR_SIDE_TOOLBAR_WIDTH_PX,
    zIndex: 30,
    py: 0.5,
    px: 0.25,
    borderRadius: 1,
    border: "1px solid",
    borderColor: "divider",
    backgroundColor: "background.paper",
} as const;

/** MenuControlsContainer 를 세로 스택으로 */
export const boardEditorVerticalMenuControlsSx = {
    width: "100%",
    "& > div": {
        flexDirection: "column",
        alignItems: "center",
        flexWrap: "nowrap",
        width: "100%",
        rowGap: 0.25,
        columnGap: 0,
    },
    /* MenuSelect 툴팁 래퍼·MenuButton·Select — 툴바 폭 기준 좌우 중앙 */
    "& > div > span, & > div > .MuiFormControl-root": {
        display: "flex !important",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        maxWidth: "100%",
    },
    "& > div > span .MuiToggleButton-root": {
        width: 36,
        height: 36,
        minWidth: 36,
        padding: 6,
        margin: "0 auto",
    },
    "& > div > span .MuiSvgIcon-root": {
        fontSize: "1.25rem",
    },
    "& .board-editor-side-toolbar-undo-redo .MuiToggleButton-root": {
        width: 26,
        height: 26,
        minWidth: 26,
        padding: 0,
    },
    "& .board-editor-side-toolbar-undo-redo .MuiSvgIcon-root": {
        fontSize: "1rem",
    },
    "& .MuiDivider-vertical": {
        width: "70%",
        height: 0,
        border: "none",
        borderTop: "1px solid",
        borderColor: "divider",
        margin: "4px auto",
    },
} as const;
