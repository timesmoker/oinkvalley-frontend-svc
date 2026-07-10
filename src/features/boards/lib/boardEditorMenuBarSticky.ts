/**
 * 게시글 에디터 MenuBar — fixed 사이트 헤더(`pt-20`) 아래에 붙도록.
 * mui-tiptap MenuBar sticky top 과 동일 값 유지.
 */
export const BOARD_EDITOR_MENU_BAR_STICKY_OFFSET_PX = 80;

/** MenuBar 가 본문 위에 남도록 z-index·overflow 보정 */
export const boardEditorMenuBarStickySx = {
    "& .MuiTiptap-MenuBar-sticky": {
        zIndex: 40,
        overflow: "visible",
    },
    "& .MuiTiptap-MenuBar-content": {
        overflow: "visible",
    },
    "& .MuiTiptap-RichTextField-root > .MuiCollapse-root": {
        overflow: "visible !important",
    },
    "& .MuiTiptap-RichTextField-root > .MuiCollapse-root > .MuiCollapse-wrapper": {
        overflow: "visible",
    },
    "& .MuiTiptap-RichTextField-root > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner":
        {
            overflow: "visible",
        },
    "& .MuiTiptap-MenuBar-content .MuiSelect-root": {
        overflow: "visible",
    },
    "& .MuiTiptap-MenuBar-content .MuiOutlinedInput-root": {
        overflow: "visible",
    },
} as const;
