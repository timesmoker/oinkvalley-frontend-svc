'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {Box, Button, Stack,} from '@mui/material'
import { useRouter } from 'next/navigation'
import type { JSONContent } from "@tiptap/core";
import {
    LinkBubbleMenu,
    RichTextEditor,
    TableBubbleMenu,
    type RichTextEditorRef,
} from "mui-tiptap";
import axios from 'axios'
import type { TableOfContentData } from "@tiptap/extension-table-of-contents";
import EditorMenuControls from "./EditorMenuControls";
import useExtensions from "./useExtensions";
import BoardDragHandle from "@/features/boards/components/BoardDragHandle";
import BoardPostTocRail from "@/features/boards/components/BoardPostTocRail";
import { boardPostProseMirrorSx } from "@/features/boards/lib/boardPostContentLayout";
import { proseMirrorDragHandleStyles } from "@/features/boards/lib/proseMirrorDragHandleStyles";
import type { BoardTocItem } from "@/features/boards/lib/extractTocFromJson";
import { createPost, updatePost } from "@/features/boards/api/boardMutations";
import { openAllDetails } from "@/features/boards/lib/detailsDom";


export default function PostEditor({
    mode = 'create',
    boardSlug,
    boardId,
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
    const rteRef = useRef<RichTextEditorRef>(null);
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

    useEffect(() => {
        setTitle(initialTitle ?? '')
    }, [initialTitle])

    useEffect(() => {
        if (!isEdit || !initialContent) return
        const t = window.setTimeout(() => {
            const editor = rteRef.current?.editor;
            editor?.commands.setContent(initialContent);
            if (editor) {
                requestAnimationFrame(() => openAllDetails(editor.view.dom));
            }
        }, 0)
        return () => window.clearTimeout(t)
    }, [isEdit, initialContent, postId])


    const handleSave = async () => {
        const editor = rteRef.current?.editor;
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
                    "& .ProseMirror": {
                        minHeight: "50vh",
                        "& h1, & h2, & h3, & h4, & h5, & h6": {
                            scrollMarginTop: 50,
                        },
                        ...boardPostProseMirrorSx,
                    },
                }}
            >
                <input
                    className="mb-2 w-full truncate rounded-md border border-gray-300 bg-white px-3 py-2 text-2xl font-bold outline-none focus:border-gray-400"
                    placeholder="제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <RichTextEditor
                    key={isEdit ? `edit-${postId}` : 'create'}
                    ref={rteRef}
                    extensions={extensions}
                    editable
                    editorProps={{}}
                    renderControls={() => <EditorMenuControls />}
                    RichTextFieldProps={{
                        variant: "outlined",
                        MenuBarProps: {
                            disableSticky: isStickyDisabled,
                        },
                        footer: (
                            <Stack
                                direction="row"
                                justifyContent="flex-end"
                                sx={{
                                    borderTopStyle: "solid",
                                    borderTopWidth: 1,
                                    py: 1,
                                    px: 1.5,
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
                        ),
                    }}
                >
                    {(editor) => (
                        <>
                            <BoardDragHandle
                                editor={editor}
                                tippyOptions={dragHandleTippyOptions}
                            />
                            <LinkBubbleMenu />
                            <TableBubbleMenu />
                        </>
                    )}
                </RichTextEditor>
            </Box>
            <BoardPostTocRail items={tocItems} postTitle={title} />
        </>
    )
}

