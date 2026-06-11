import type { SxProps, Theme } from "@mui/material";
import type { LinkBubbleMenuProps } from "mui-tiptap";

/** 링크 입력·미리보기 패널 — 촘촘한 폼 */
export const boardEditorLinkBubbleMenuPaperSx: SxProps<Theme> = {
    minWidth: 176,
    maxWidth: 212,
    "& > div": {
        padding: "6px 8px 4px !important",
    },
    "& .MuiTypography-h6": {
        fontSize: "0.8125rem",
        fontWeight: 600,
        lineHeight: 1.3,
        mb: 0.25,
    },
    "& .MuiTextField-root": {
        my: 0.25,
    },
    "& .MuiInputLabel-root": {
        fontSize: "0.75rem",
    },
    "& .MuiInputBase-root": {
        fontSize: "0.8125rem",
    },
    "& .MuiInputBase-input": {
        py: 0.5,
    },
    "& .MuiDialogActions-root": {
        pt: 0.25,
        pb: 0,
        gap: 0.5,
    },
    "& .MuiButton-root": {
        minWidth: 0,
        px: 1,
        py: 0.25,
        fontSize: "0.75rem",
    },
};

/** 좌측 툴바 — 아래 칸 가리지 않고 오른쪽(에디터 쪽)으로 */
export const boardEditorSideToolbarLinkBubbleOptions: Partial<LinkBubbleMenuProps> =
    {
        placement: "right-start",
        fallbackPlacements: ["right", "right-end", "left-start", "left"],
        flipPadding: 4,
    };
