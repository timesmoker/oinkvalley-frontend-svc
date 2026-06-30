/** 게시글 본문 ProseMirror 안쪽 여백 — 좌측은 에디터 드래그 핸들 영역과 맞춤 */
export const boardPostProseMirrorContentPadding = {
    paddingTop: "1rem",
    paddingRight: "1rem",
    paddingBottom: "1rem",
    paddingLeft: "2.25rem",
} as const;

/** 제목·메타·본문 한 컬럼 — 상단 여백만 (좌우는 블록별로 prose 와 맞춤) */
export const boardPostArticleColumnClassName = "w-full min-w-0 pt-12 pb-4";

/** 제목 블록 — 본문 첫 줄과 같은 좌우 여백 */
export const boardPostTitleBlockClassName =
    "w-full min-w-0 pl-[2.25rem] pr-4 pb-3";

/** 페이지 제목 40px (뷰어 h1 · 에디터 input) */
export const boardPostTitleClassName =
    "w-full min-w-0 bg-transparent outline-none text-[40px] font-bold leading-[1.2] tracking-tight text-gray-900 placeholder:text-gray-300 placeholder:font-bold";

/** 제목 아래 작성자·작성시각 — 우측 정렬 */
export const boardPostMetaRowClassName =
    "flex justify-end items-center flex-wrap gap-x-3 gap-y-1 pl-[2.25rem] pr-4 pb-5 text-[0.8125rem] text-gray-500";

/** 게시글 문서 외곽 (에디터·뷰어) */
export const boardPostDocumentShellClassName =
    "border border-gray-200 rounded-md overflow-hidden bg-white";

/** Viewer — 제목·메타가 같은 컬럼일 때 본문 상단 padding 제거 */
export const boardPostViewerContentPaddingTop = 0;

/** 게시글 본문 ProseMirror — 제목 아래 이어질 때 상단 padding 없음 */
export const boardPostArticleProsePaddingTop = 0;

/**
 * 글쓰기/수정 — 제목과 한 문서처럼 보이게 RichTextField(standard) 흔적 제거.
 * - FieldContainer notchedOutline(테두리·hover·focus 링) 제거
 * - content padding 0 → ProseMirror 자체 padding 만 사용 (제목 좌측선과 일치)
 */
export const boardPostEditorRichTextFieldSx = {
    paddingTop: 0,
    "& .MuiTiptap-RichTextField-root": {
        borderRadius: 0,
        marginTop: 0,
    },
    /* 본문 콘텐츠만 — 메뉴바(.menuBarContent에도 content 클래스 붙음)는 유지 */
    "& .MuiTiptap-RichTextContent-root": {
        padding: "0 !important",
    },
    "& .MuiTiptap-FieldContainer-notchedOutline": {
        border: "none !important",
    },
    "& .MuiOutlinedInput-notchedOutline": {
        border: "none !important",
    },
} as const;

const boardPostProseMirrorFirstHeadingChildSelector =
    "> h1:first-child, > h2:first-child, > h3:first-child, > h4:first-child, > h5:first-child, > h6:first-child";

/**
 * Viewer 본문 래퍼 (게시글 상세).
 * 첫 블록이 heading이면 래퍼 padding만 쓰고 ProseMirror paddingTop은 0 — 이중 여백 방지.
 */
export const boardPostViewerBodySx = {
    paddingTop: boardPostViewerContentPaddingTop,
    [`& .ProseMirror:has(${boardPostProseMirrorFirstHeadingChildSelector})`]: {
        paddingTop: 0,
    },
} as const;
