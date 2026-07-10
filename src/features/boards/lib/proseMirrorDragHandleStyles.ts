import { boardPostProseMirrorContentPadding } from "@/features/boards/shared/layout/boardPostSurfaceStyles";

/** Drag handle — ProseMirror 왼쪽 여백 + 핸들 표시 */
export const proseMirrorDragHandleStyles = {
    "& .ProseMirror": {
        paddingLeft: boardPostProseMirrorContentPadding.paddingLeft,
    },
    "& .drag-handle": {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "1.25rem",
        height: "1.25rem",
        borderRadius: "0.25rem",
        backgroundColor: "action.hover",
    },
} as const;
