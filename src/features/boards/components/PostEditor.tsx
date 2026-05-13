'use client'

import { useEffect, useRef, useState } from 'react'
import {Box, Button, Stack,} from '@mui/material'
import { useRouter } from 'next/navigation'
import type { JSONContent } from "@tiptap/core";
import {
    LinkBubbleMenu,
    MenuButton,
    RichTextEditor,
    TableBubbleMenu,
    type RichTextEditorRef,
} from "mui-tiptap";
import Lock from "@mui/icons-material/Lock";
import LockOpen from "@mui/icons-material/LockOpen";
import TextFields from "@mui/icons-material/TextFields";
import axios from 'axios'
import EditorMenuControls from "./EditorMenuControls";
import useExtensions from "./useExtensions";
import { createPost, updatePost } from "@/features/boards/api/boardMutations";


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
    const [isEditable, setIsEditable] = useState(true);
    const [showMenuBar, setShowMenuBar] = useState(true);

    const router = useRouter()
    const [title, setTitle] = useState(initialTitle ?? '')
    const [submitting, setSubmitting] = useState(false)
    const rteRef = useRef<RichTextEditorRef>(null);
    const extensions = useExtensions({
        placeholder: "Add your own content here...",
    });
    const isStickyDisabled = disableStickyMenuBar ?? false

    useEffect(() => {
        setTitle(initialTitle ?? '')
    }, [initialTitle])

    useEffect(() => {
        if (!isEdit || !initialContent) return
        const t = window.setTimeout(() => {
            rteRef.current?.editor?.commands.setContent(initialContent)
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
                    minHeight: '60%',
                    "& .ProseMirror": {
                        minHeight: '50vh',
                        padding: '1rem',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',

                        "& ol, & ul": {
                            paddingLeft: '1.5rem', // 들여쓰기
                            marginLeft: 0,
                        },

                        "& h1, & h2, & h3, & h4, & h5, & h6": {
                            scrollMarginTop: showMenuBar ? 50 : 0,
                        },
                    },
                }}
            >
                <input
                    className="text-2xl font-bold border-b p-2 outline-none w-full truncate"
                    placeholder="제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <RichTextEditor
                    key={isEdit ? `edit-${postId}` : 'create'}
                    ref={rteRef}
                    extensions={extensions}
                    editable={isEditable}
                    editorProps={{}}
                    renderControls={() => <EditorMenuControls />}
                    RichTextFieldProps={{
                        // The "outlined" variant is the default (shown here only as
                        // example), but can be changed to "standard" to remove the outlined
                        // field border from the editor
                        variant: "outlined",
                        MenuBarProps: {
                            hide: !showMenuBar,
                            disableSticky: isStickyDisabled,
                        },

                        // Below is an example of adding a toggle within the outlined field
                        // for showing/hiding the editor menu bar, and a "submit" button for
                        // saving/viewing the HTML content
                        footer: (
                            <Stack
                                direction="row"
                                spacing={2}
                                sx={{
                                    borderTopStyle: "solid",
                                    borderTopWidth: 1,
                                    py: 1,
                                    px: 1.5,
                                }}
                            >
                                <MenuButton
                                    value="formatting"
                                    tooltipLabel={
                                        showMenuBar ? "Hide formatting" : "Show formatting"
                                    }
                                    size="small"
                                    onClick={() => {
                                        setShowMenuBar((currentState) => !currentState);
                                    }}
                                    selected={showMenuBar}
                                    IconComponent={TextFields}
                                />

                                <MenuButton
                                    value="formatting"
                                    tooltipLabel={
                                        isEditable
                                            ? "Prevent edits (use read-only mode)"
                                            : "Allow edits"
                                    }
                                    size="small"
                                    onClick={() => {
                                        setIsEditable((currentState) => !currentState);
                                    }}
                                    selected={!isEditable}
                                    IconComponent={isEditable ? Lock : LockOpen}
                                />

                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handleSave} disabled={submitting}
                                >
                                    {isEdit ? "수정 저장" : "Save"}
                                </Button>
                            </Stack>
                        ),
                    }}
                >
                    {() => (
                        <>
                            <LinkBubbleMenu />
                            <TableBubbleMenu />
                        </>
                    )}
                </RichTextEditor>
            </Box>
        </>
    )
}

