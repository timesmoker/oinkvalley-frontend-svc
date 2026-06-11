import type { SxProps, Theme } from "@mui/material";

/** 닫힌 상태·드롭다운 공통 — 짧은 스타일 라벨 */
export const BOARD_EDITOR_HEADING_LABELS = {
    paragraph: "para",
    heading1: "H1",
    heading2: "H2",
    heading3: "H3",
    heading4: "H4",
    heading5: "H5",
    heading6: "H6",
    empty: "para",
};

export const BOARD_EDITOR_FONT_FAMILY_OPTIONS = [
    { label: "Comic", value: "Comic Sans MS, Comic Sans" },
    { label: "Cursive", value: "cursive" },
    { label: "Mono", value: "monospace" },
    { label: "Serif", value: "serif" },
] as const;

/** 상단 가로 툴바 — 라벨과 화살표 겹침 방지 */
const compactMenuBarSelectArrowSx = {
    "& .MuiOutlinedInput-root": {
        overflow: "visible",
    },
    "& .MuiSelect-select": {
        py: 0.25,
        pl: 0.5,
        pr: "22px !important",
        fontSize: "0.8125rem",
        fontWeight: 600,
        lineHeight: 1.2,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        boxSizing: "border-box",
    },
    "& .MuiSelect-icon": {
        right: "2px !important",
        width: "16px !important",
        color: "action.active",
        pointerEvents: "none",
    },
} as const;

/** 상단 가로 툴바 Select 공통 */
export const boardEditorCompactMenuBarSelectSx: SxProps<Theme> = {
    ...compactMenuBarSelectArrowSx,
    maxWidth: "100%",
};

/** mui-tiptap 기본 55px 보다 좁게 — Font */
export const boardEditorCompactSelectInputSx: SxProps<Theme> = {
    width: 52,
    minWidth: 52,
    maxWidth: 56,
    ...compactMenuBarSelectArrowSx,
};

/** mui-tiptap 기본 77px 보다 좁게 — para/H1 */
export const boardEditorCompactHeadingSelectInputSx: SxProps<Theme> = {
    width: 44,
    minWidth: 44,
    maxWidth: 48,
    ...compactMenuBarSelectArrowSx,
};

/** mui-tiptap FontSize 프리셋 — 48px까지 (더 큰 값은 직접 입력) */
export const BOARD_EDITOR_FONT_SIZE_OPTIONS = [
    "8px",
    "9px",
    "10px",
    "11px",
    "12px",
    "14px",
    "16px",
    "18px",
    "24px",
    "30px",
    "36px",
    "48px",
] as const;

/** 글자 크기 메뉴 항목 높이 — boardEditorFontSizeMenuPaperSx 와 동일 */
const BOARD_EDITOR_FONT_SIZE_MENU_ITEM_HEIGHT_PX = 26;

/** subheader(34) + Default + 8~24px 프리셋(10항목) — 스크롤 없이 보이는 구간 */
const BOARD_EDITOR_FONT_SIZE_MENU_VISIBLE_HEIGHT_PX =
    34 + 10 * BOARD_EDITOR_FONT_SIZE_MENU_ITEM_HEIGHT_PX;

/** mui-tiptap 기본 17px 아이콘 칸보다 숫자 표시용으로 약간 넓게 */
export const boardEditorCompactFontSizeSelectInputSx: SxProps<Theme> = {
    width: 40,
    minWidth: 40,
    maxWidth: 44,
    ...compactMenuBarSelectArrowSx,
};

/** 상단 가로 툴바 — 정렬(아이콘만) */
export const boardEditorCompactMenuBarAlignSelectSx: SxProps<Theme> = {
    ...compactMenuBarSelectArrowSx,
    width: 36,
    minWidth: 36,
    maxWidth: 36,
    "& .MuiSelect-select": {
        ...compactMenuBarSelectArrowSx["& .MuiSelect-select"],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pl: "2px !important",
        pr: "18px !important",
    },
};

const boardEditorSideToolbarSelectArrowSx = {
    "& .MuiSelect-icon": {
        /* mui-tiptap MenuSelect 기본 right:1 덮어씀 */
        right: "4px !important",
        width: 10,
        height: 10,
        top: "calc(50% - 5px)",
    },
} as const;

/**
 * 좌측 세로 툴바 — Font / para / 글자크기(숫자).
 * 루트(OutlinedInput)가 내용 폭만큼만 차지해, 래퍼 flex가
 * "텍스트+화살표" 그룹째로 가운데 정렬한다.
 * 좌패딩 5px ↔ 화살표 우측 여백 4px로 그룹 좌우 균형.
 */
export const boardEditorSideToolbarTextSelectInputSx: SxProps<Theme> = {
    width: "auto",
    minWidth: 0,
    maxWidth: "100%",
    minHeight: 32,
    height: 32,
    fontSize: "0.75rem",
    ...boardEditorSideToolbarSelectArrowSx,
    "& .MuiSelect-select": {
        display: "flex !important",
        alignItems: "center",
        /* mui-tiptap 고정폭(55/77px) 무시 — 내용만큼만 */
        width: "auto !important",
        py: "5px !important",
        pl: "5px !important",
        /* 화살표 10px + 텍스트와 간격 3px + 우측 4px */
        pr: "17px !important",
        minHeight: "28px !important",
        fontSize: "0.75rem",
        fontWeight: 600,
        lineHeight: 1.2,
        boxSizing: "border-box",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
};

/** 좌측 세로 툴바 — 정렬·글자크기(아이콘). 아이콘+화살표 그룹째 중앙 정렬 */
export const boardEditorSideToolbarIconSelectInputSx: SxProps<Theme> = {
    width: "auto",
    minWidth: 0,
    maxWidth: "100%",
    minHeight: 32,
    height: 32,
    ...boardEditorSideToolbarSelectArrowSx,
    "& .MuiSelect-select": {
        display: "flex !important",
        alignItems: "center",
        width: "auto !important",
        py: "5px !important",
        pl: "4px !important",
        /* 화살표 10px + 아이콘과 간격 3px + 우측 4px */
        pr: "17px !important",
        minHeight: "28px !important",
        boxSizing: "border-box",
    },
};

/** 입력칸 값 → FontSize 확장용 CSS 값 */
export function normalizeBoardEditorFontSizeInput(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
    if (/^\d+(\.\d+)?(px|rem|em|%)$/i.test(trimmed)) return trimmed;
    return null;
}

export function stripPxFromFontSizeValue(value: string): string {
    return value.replace(/px$/i, "");
}

/** para/H1 드롭다운 — 닫힌 값은 짧은 라벨, 목록은 mui-tiptap heading 실제 크기 */
export const boardEditorHeadingMenuPaperSx = (
    orientation: "horizontal" | "vertical",
): SxProps<Theme> => ({
    minWidth: orientation === "vertical" ? 72 : 88,
    maxWidth: orientation === "vertical" ? 120 : 140,
    py: 0.25,
    "& .MuiMenuItem-root": {
        minHeight: "unset",
        py: 0.375,
        px: 1.25,
        fontSize: "0.75rem",
        fontWeight: 600,
        overflow: "visible",
    },
    /* para — 짧은 라벨 크기 유지 */
    "& .MuiMenuItem-root:first-of-type": {
        minHeight: 26,
        py: 0.125,
    },
});

/** 글자 크기 드롭다운 — 24px까지 보이고 30~48px는 스크롤 */
export const boardEditorFontSizeMenuPaperSx = (
    orientation: "horizontal" | "vertical",
): SxProps<Theme> => ({
    minWidth: orientation === "vertical" ? 68 : 80,
    maxWidth: orientation === "vertical" ? 76 : 88,
    py: 0.25,
    "& .MuiList-root": {
        maxHeight: BOARD_EDITOR_FONT_SIZE_MENU_VISIBLE_HEIGHT_PX,
        overflowY: "auto",
        overflowX: "hidden",
    },
    "& .MuiListSubheader-root": {
        lineHeight: 1,
        py: 0.5,
        px: 0.75,
        position: "sticky",
        top: 0,
        zIndex: 1,
        bgcolor: "background.paper",
    },
    "& .MuiMenuItem-root": {
        minHeight: BOARD_EDITOR_FONT_SIZE_MENU_ITEM_HEIGHT_PX,
        py: 0.125,
        px: 1.25,
        fontSize: "0.75rem",
    },
});
