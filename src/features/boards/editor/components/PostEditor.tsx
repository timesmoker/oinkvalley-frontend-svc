'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {Box, Button, Stack, useMediaQuery, useTheme,} from '@mui/material'
import type { JSONContent } from "@tiptap/core";
import { useEditor } from "@tiptap/react";
import {
    LinkBubbleMenu,
    RichTextEditorProvider,
    RichTextField,
    TableBubbleMenu,
} from "mui-tiptap";
import EditorMenuControls from "./EditorMenuControls";
import useBoardExtensions from "@/features/boards/shared/hooks/useBoardExtensions";
import BoardDragHandle from "@/features/boards/editor/components/BoardDragHandle";
import BoardEditorSideToolbar from "./BoardEditorSideToolbar";
import BoardEditorShortcutRail from "./BoardEditorShortcutRail";
import BoardPostTocRail from "@/features/boards/toc/components/BoardPostTocRail";
import { boardEditorLinkBubbleMenuPaperSx } from "@/features/boards/lib/boardEditorLinkBubbleMenu";
import {
    boardPostArticleColumnClassName,
    boardPostArticleProsePaddingTop,
    boardPostDocumentShellClassName,
    boardPostEditorRichTextFieldSx,
    boardPostTitleBlockClassName,
    boardPostTitleClassName,
} from "@/features/boards/shared/layout/boardPostSurfaceStyles";
import { boardPostProseMirrorSx } from "@/features/boards/shared/layout/boardPostProseMirrorStyles";
import { proseMirrorDragHandleStyles } from "@/features/boards/lib/proseMirrorDragHandleStyles";
import {
    BOARD_EDITOR_MENU_BAR_STICKY_OFFSET_PX,
    boardEditorMenuBarStickySx,
} from "@/features/boards/lib/boardEditorMenuBarSticky";
import { BOARD_EDITOR_COMPACT_TOOLBAR_BREAKPOINT } from "@/features/boards/lib/boardEditorToolbarLayout";
import { proseMirrorEditorSelectionStyles } from "@/features/boards/lib/proseMirrorSelectionStyles";
import {
    extractTocFromJson,
    type BoardTocItem,
} from "@/features/boards/toc/lib/extractTocFromJson";
import usePostEditorPersistence from "@/features/boards/editor/hooks/usePostEditorPersistence";
import { openAllDetails } from "@/features/boards/lib/detailsDom";
import { BOARD_POST_DOCUMENT_SHELL_ID } from "@/features/boards/lib/boardPostScrollAnchor";
import { BoardEditorToolbarProvider } from "@/features/boards/editor/context/BoardEditorToolbarContext";
const SHOW_DRAFT_ACTIONS = false;

export default function PostEditor({
    mode = 'create',
    boardSlug,
    boardId,
    boardName,
    postId,
    initialTitle,
    initialContent,
    disableStickyMenuBar,
    onSuccess,
}: {
    mode?: 'create' | 'edit'
    /** 저장 후 이동·표시용 URL 슬러그 (`/boards/{boardSlug}`) */
    boardSlug: string;
    boardId: number;
    /** 페이지 상단 게시판 이름 (글쓰기/수정) */
    boardName: string;
    /** 수정 모드일 때 대상 글 id */
    postId?: string;
    initialTitle?: string;
    initialContent?: JSONContent;
    disableStickyMenuBar?: boolean
    onSuccess?: () => void

}) {
    const isEdit = mode === 'edit'

    const [title, setTitle] = useState(initialTitle ?? '')
    const [tocItems, setTocItems] = useState<BoardTocItem[]>([])
    const editorBodyRef = useRef<HTMLDivElement>(null)
    const titleRowRef = useRef<HTMLDivElement>(null)
    const [toolbarElement, setToolbarElement] = useState<HTMLElement | null>(null)
    const theme = useTheme()
    const useCompactToolbar = useMediaQuery(
        theme.breakpoints.down(BOARD_EDITOR_COMPACT_TOOLBAR_BREAKPOINT),
    )
    const extensions = useBoardExtensions({
        placeholder: "Add your own content here...",
        scope: "post",
    });
    const dragHandleTippyOptions = useMemo(
        () => ({ placement: "left-start" as const }),
        [],
    )
    const isStickyDisabled = disableStickyMenuBar ?? false
    const titleInputRef = useRef<HTMLInputElement>(null)
    const editor = useEditor(
        {
            extensions,
            editable: true,
            editorProps: {
                // 본문 맨 앞에서 ↑/Backspace → 제목으로 (노션처럼 한 문서 흐름)
                handleKeyDown: (view, event) => {
                    if (event.key !== "ArrowUp" && event.key !== "Backspace") {
                        return false
                    }
                    const { selection } = view.state
                    if (!selection.empty || selection.from > 1) return false
                    titleInputRef.current?.focus()
                    if (event.key === "ArrowUp") {
                        const len = titleInputRef.current?.value.length ?? 0
                        titleInputRef.current?.setSelectionRange(len, len)
                    }
                    return true
                },
            },
        },
        [extensions],
    )
    const { submitting, saveDraft, loadDraft, savePost } = usePostEditorPersistence({
        mode,
        boardSlug,
        boardId,
        postId,
        title,
        setTitle,
        editor,
        onSuccess,
    });

    // 뷰어와 동일한 추출 경로(extractTocFromJson) — 목차 형태 편집/열람 일치
    useEffect(() => {
        if (!editor) return
        const syncToc = () => setTocItems(extractTocFromJson(editor.getJSON()))
        syncToc()
        editor.on("update", syncToc)
        return () => {
            editor.off("update", syncToc)
        }
    }, [editor])

    useEffect(() => {
        setTitle(initialTitle ?? '')
    }, [initialTitle])

    useEffect(() => {
        if (!isEdit || !initialContent) return
        const t = window.setTimeout(() => {
            editor?.commands.setContent(initialContent);
            if (editor) {
                requestAnimationFrame(() => openAllDetails(editor.view.dom));
            }
        }, 0)
        return () => window.clearTimeout(t)
    }, [isEdit, initialContent, postId, editor])

    return (
        <>
            <Box
                sx={{
                    minHeight: "60%",
                    width: "100%",
                    ...proseMirrorDragHandleStyles,
                    ...proseMirrorEditorSelectionStyles,
                    ...(useCompactToolbar ? boardEditorMenuBarStickySx : {}),
                }}
            >
                <h1
                    id="board-post-scroll-anchor"
                    className="text-2xl font-bold mb-4"
                >
                    {boardName}
                </h1>

                <div id={BOARD_POST_DOCUMENT_SHELL_ID} className={boardPostDocumentShellClassName}>
                <RichTextEditorProvider
                    key={isEdit ? `edit-${postId}` : "create"}
                    editor={editor}
                >
                    <Box
                        ref={editorBodyRef}
                        sx={{
                            width: "100%",
                            minHeight: 200,
                            ...boardPostEditorRichTextFieldSx,
                            "& .ProseMirror": {
                                minHeight: "50vh",
                                "& h1, & h2, & h3, & h4, & h5, & h6": {
                                    scrollMarginTop: BOARD_EDITOR_MENU_BAR_STICKY_OFFSET_PX + 48,
                                },
                                ...boardPostProseMirrorSx,
                                paddingTop: boardPostArticleProsePaddingTop,
                            },
                        }}
                    >
                        <div className={boardPostArticleColumnClassName}>
                            <div
                                ref={titleRowRef}
                                className={boardPostTitleBlockClassName}
                            >
                                <input
                                    ref={titleInputRef}
                                    className={boardPostTitleClassName}
                                    placeholder="제목"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        // Enter/↓ → 본문 맨 앞으로 (제목과 본문이 한 문서)
                                        if (
                                            e.key === "Enter" ||
                                            e.key === "ArrowDown"
                                        ) {
                                            e.preventDefault()
                                            editor
                                                ?.chain()
                                                .focus("start")
                                                .run()
                                        }
                                    }}
                                />
                            </div>
                            <RichTextField
                                variant="standard"
                                disabled={!editor}
                                controls={
                                    useCompactToolbar ? (
                                        <EditorMenuControls />
                                    ) : undefined
                                }
                                MenuBarProps={
                                    useCompactToolbar
                                        ? {
                                              disableSticky: isStickyDisabled,
                                              stickyOffset:
                                                  BOARD_EDITOR_MENU_BAR_STICKY_OFFSET_PX,
                                          }
                                        : undefined
                                }
                                footer={
                                    <Stack
                                        direction="row"
                                        justifyContent="flex-end"
                                        spacing={1}
                                        sx={{
                                            borderTop: "1px solid",
                                            borderColor: "divider",
                                            py: 1.5,
                                            px: 2,
                                            bgcolor: "grey.50",
                                        }}
                                    >
                                        {SHOW_DRAFT_ACTIONS && (
                                            <>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={saveDraft}
                                                    disabled={submitting || !editor}
                                                >
                                                    임시저장
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={loadDraft}
                                                    disabled={submitting || !editor}
                                                >
                                                    불러오기
                                                </Button>
                                            </>
                                        )}
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={savePost}
                                            disabled={submitting}
                                        >
                                            {isEdit ? "수정 저장" : "저장"}
                                        </Button>
                                    </Stack>
                                }
                            />
                        </div>
                    </Box>

                    {editor && (
                        <>
                            <BoardDragHandle
                                editor={editor}
                                tippyOptions={dragHandleTippyOptions}
                            />
                            <LinkBubbleMenu
                                PaperProps={{
                                    sx: {
                                        ml: 0.75,
                                        ...boardEditorLinkBubbleMenuPaperSx,
                                    },
                                }}
                                labels={{
                                    editLinkAddTitle: "링크",
                                    editLinkEditTitle: "링크 수정",
                                    editLinkTextInputLabel: "텍스트",
                                    editLinkHrefInputLabel: "URL",
                                    editLinkCancelButtonLabel: "취소",
                                    editLinkSaveButtonLabel: "저장",
                                }}
                            />
                            <TableBubbleMenu />
                        </>
                    )}
                </RichTextEditorProvider>
                </div>
            </Box>
            <BoardEditorToolbarProvider
                value={{
                    toolbarElement,
                    setToolbarElement,
                }}
            >
                {!useCompactToolbar && (
                    <BoardEditorSideToolbar
                        editor={editor}
                        anchorRef={editorBodyRef}
                    />
                )}
                {!useCompactToolbar && <BoardEditorShortcutRail />}
            </BoardEditorToolbarProvider>
            <BoardPostTocRail
                items={tocItems}
            />
        </>
    )
}

