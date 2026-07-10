/** Shared ProseMirror styles for editor + read-only viewer. */
export const proseMirrorDetailsStyles = {
    "& div[data-type='details']": {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "0.35rem",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        marginBlock: "0.75rem",
        padding: "0.25rem 0.5rem",
    },
    /* NodeView contentDOM 래퍼 — display:contents로 summary를 button 옆에 배치 */
    "& div[data-type='details'] > button + div": {
        display: "contents",
    },
    "& div[data-type='details'] > button": {
        flexShrink: 0,
        padding: 0,
        width: "1.25rem",
        height: "1.25rem",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: "0.85rem",
        lineHeight: 1,
        "&::before": {
            content: '"▸"',
        },
    },
    "& div[data-type='details'].is-open > button::before": {
        content: '"▾"',
    },
    "& div[data-type='detailsContent'][hidden]": {
        display: "none",
    },
    "& div[data-type='detailsContent']": {
        flexBasis: "100%",
        width: "100%",
    },
    /* 펼침 시 summary ↔ 본문 사이 한 줄 정도 여백 */
    "& div[data-type='details'].is-open div[data-type='detailsContent']": {
        paddingTop: "0.5em",
        lineHeight: 1.5,
    },
    "& div[data-type='detailsSummary'], & summary": {
        fontWeight: 600,
        listStyle: "none",
        flex: "1 1 auto",
        minWidth: 0,
    },
    /* 뷰어: summary 클릭 토글 */
    "& .ProseMirror[contenteditable='false'] div[data-type='detailsSummary'], & .ProseMirror[contenteditable='false'] summary":
        {
            cursor: "pointer",
        },
} as const;
