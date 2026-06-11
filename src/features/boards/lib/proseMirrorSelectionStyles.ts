/** 블록 선택(Ctrl+A 등) — 배경만 */
const BLOCK_SELECTION_FILL = "rgba(33, 150, 243, 0.14)";

const IMAGE_SELECTION_OUTLINE = "2px solid #2196f3";

const nodeRangeBlockHighlight = {
    outline: "none !important",
    boxShadow: "none !important",
    backgroundColor: BLOCK_SELECTION_FILL,
    borderRadius: "2px",
} as const;

/**
 * Editor 선택 UI.
 * - 이미지 NodeView 래퍼는 width 100% → selectednode 테두리가 이미지보다 넓어짐 → 래퍼는 끔, img 만.
 */
export const proseMirrorEditorSelectionStyles = {
    "& .ProseMirror .ProseMirror-selectednode": {
        outline: "none !important",
        boxShadow: "none !important",
    },
    "& .ProseMirror .ProseMirror-selectednoderange": nodeRangeBlockHighlight,
    "& .ProseMirror.ProseMirror-noderangeselection .ProseMirror-selectednoderange":
        nodeRangeBlockHighlight,
    "& .ProseMirror [data-node-view-wrapper].ProseMirror-selectednode": {
        outline: "none !important",
        boxShadow: "none !important",
        backgroundColor: "transparent !important",
    },
    "& .ProseMirror img.ProseMirror-selectednode": {
        outline: `${IMAGE_SELECTION_OUTLINE} !important`,
        outlineOffset: 0,
        boxShadow: "none !important",
    },
} as const;

/** Viewer — 선택 UI 없음 */
export const proseMirrorReadOnlySelectionStyles = {
    "& .ProseMirror[contenteditable='false'] .ProseMirror-selectednoderange, & .ProseMirror[contenteditable='false'] .ProseMirror-selectednode, & .ProseMirror[contenteditable='false'] img, & .ProseMirror[contenteditable='false'] [data-node-view-wrapper]":
        {
            outline: "none !important",
            boxShadow: "none !important",
            backgroundColor: "transparent !important",
        },
} as const;
