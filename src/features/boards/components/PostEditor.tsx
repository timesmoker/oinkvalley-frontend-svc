'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {Box, Button, Stack, useMediaQuery, useTheme,} from '@mui/material'
import { useRouter } from 'next/navigation'
import type { JSONContent } from "@tiptap/core";
import { useEditor } from "@tiptap/react";
import {
    LinkBubbleMenu,
    RichTextEditorProvider,
    RichTextField,
    TableBubbleMenu,
} from "mui-tiptap";
import axios from 'axios'
import type { TableOfContentData } from "@tiptap/extension-table-of-contents";
import EditorMenuControls from "./EditorMenuControls";
import useExtensions from "./useExtensions";
import BoardDragHandle from "@/features/boards/components/BoardDragHandle";
import BoardEditorSideToolbar from "@/features/boards/components/BoardEditorSideToolbar";
import BoardPostTocRail from "@/features/boards/components/BoardPostTocRail";
import { boardEditorLinkBubbleMenuPaperSx } from "@/features/boards/lib/boardEditorLinkBubbleMenu";
import {
    boardPostArticleColumnClassName,
    boardPostArticleProsePaddingTop,
    boardPostDocumentShellClassName,
    boardPostEditorRichTextFieldSx,
    boardPostProseMirrorSx,
    boardPostTitleBlockClassName,
    boardPostTitleClassName,
} from "@/features/boards/lib/boardPostContentLayout";
import { proseMirrorDragHandleStyles } from "@/features/boards/lib/proseMirrorDragHandleStyles";
import {
    BOARD_EDITOR_MENU_BAR_STICKY_OFFSET_PX,
    boardEditorMenuBarStickySx,
} from "@/features/boards/lib/boardEditorMenuBarSticky";
import { BOARD_EDITOR_COMPACT_TOOLBAR_BREAKPOINT } from "@/features/boards/lib/boardEditorToolbarLayout";
import { proseMirrorEditorSelectionStyles } from "@/features/boards/lib/proseMirrorSelectionStyles";
import type { BoardTocItem } from "@/features/boards/lib/extractTocFromJson";
import { createPost, updatePost } from "@/features/boards/api/boardMutations";
import { openAllDetails } from "@/features/boards/lib/detailsDom";


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

    const router = useRouter()
    const [title, setTitle] = useState(initialTitle ?? '')
    const [submitting, setSubmitting] = useState(false)
    const [tocItems, setTocItems] = useState<BoardTocItem[]>([])
    const editorBodyRef = useRef<HTMLDivElement>(null)
    const titleRowRef = useRef<HTMLDivElement>(null)
    const theme = useTheme()
    const useCompactToolbar = useMediaQuery(
        theme.breakpoints.down(BOARD_EDITOR_COMPACT_TOOLBAR_BREAKPOINT),
    )
    const handleTocUpdate = useCallback((data: TableOfContentData) => {
        setTocItems(
            data.map((item) => ({
                id: item.id,
                textContent: item.textContent,
                level: item.level,
            })),
        )
    }, [])
    const extensions = useExtensions({
        placeholder: "Add your own content here...",
        scope: "post",
        onTableOfContentsUpdate: handleTocUpdate,
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


    const handleSave = async () => {
        if (!editor || submitting) return;
        if (isEdit && !postId) {
            alert("글 정보가 없습니다.");
            return;
        }

        setSubmitting(true);

        const content = editor.getJSON(); // 💾 에디터 상태 JSON 그대로 저장

        try {
            if (isEdit) {
                await updatePost(postId, {
                    title,
                    content,
                });
            } else {
                await createPost({
                    boardId,
                    title,
                    content,
                });
            }

            console.log("✅ 저장 완료");
            onSuccess?.();
            if (isEdit && postId) {
                router.push(`/boards/${boardSlug}/${postId}`)
            } else {
                router.push(`/boards/${boardSlug}?refresh=1`);
            }
            router.refresh()
        } catch (err) {
            console.error("❌ 에러 발생:", err);
            if (axios.isAxiosError(err)) {
                const status = err.response?.status;
                if (status === 401) {
                    alert("로그인이 필요합니다.");
                } else if (status === 403) {
                    alert("권한이 없습니다.");
                } else {
                    alert("저장 중 오류 발생");
                }
            } else {
                alert("저장 중 오류 발생");
            }
        } finally {
            setSubmitting(false);
        }
    };


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

                <div className={boardPostDocumentShellClassName}>
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
                                        sx={{
                                            borderTop: "1px solid",
                                            borderColor: "divider",
                                            py: 1.5,
                                            px: 2,
                                            bgcolor: "grey.50",
                                        }}
                                    >
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={handleSave}
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
            {!useCompactToolbar && (
                <BoardEditorSideToolbar
                    editor={editor}
                    anchorRef={editorBodyRef}
                />
            )}
            <BoardPostTocRail
                items={tocItems}
                postTitle={title}
                anchorRef={editorBodyRef}
            />
        </>
    )
}

