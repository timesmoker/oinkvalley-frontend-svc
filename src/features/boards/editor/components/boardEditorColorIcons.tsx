import { createSvgIcon } from "@mui/material";

/** 좌·상단 툴바 — 글자색 (A) */
export const BoardEditorTextColorIcon = createSvgIcon(
    <path d="M 5.49 17 h 2.42 l 1.27 -3.58 h 5.65 L 16.09 17 h 2.42 L 13.25 3 h -2.5 L 5.49 17 z m 4.42 -5.61 l 2.03 -5.79 h 0.12 l 2.03 5.79 H 9.91 z" />,
    "BoardEditorTextColor",
);

/** 좌·상단 툴바 — 형광 하이라이트 (마커) */
export const BoardEditorHighlightColorIcon = createSvgIcon(
    <path d="M 10.6 8 l 5.4 5.425 l -4 4 q -0.6 0.6 -1.413 0.6 t -1.412 -0.6 L 8.5 18 h -5 l 3.15 -3.125 q -0.6 -0.6 -0.625 -1.438 T 6.6 12 l 4 -4 Z M 12 6.575 L 16 2.6 q 0.6 -0.6 1.413 -0.6 t 1.412 0.6 l 2.6 2.575 q 0.6 0.6 0.6 1.413 T 21.425 8 l -4 4 L 12 6.575 Z" />,
    "BoardEditorHighlightColor",
);
