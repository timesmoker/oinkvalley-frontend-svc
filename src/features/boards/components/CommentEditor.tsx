'use client'

import { useEffect, useRef, useState } from 'react'
import { Box, Button } from '@mui/material'
import type { JSONContent } from '@tiptap/core'
import {
    RichTextEditor,
    type RichTextEditorRef,
} from 'mui-tiptap'
import axios from 'axios'
import EditorMenuControls from "./EditorMenuControls";
import useExtensions from "./useExtensions";
import { createComment, updateComment } from "@/features/boards/api/boardMutations";

export default function CommentEditor({
    postId,
    commentId,
    initialContent,
    onCancel,
    onSuccess,
}: {
    postId: string
    /** 있으면 수정 모드 — `PUT /comments/{commentId}` */
    commentId?: number
    initialContent?: JSONContent
    onCancel?: () => void
    onSuccess?: () => void
}) {
    const isEdit = commentId != null
    const editorRef = useRef<RichTextEditorRef>(null)
    const [submitting, setSubmitting] = useState(false)
    const extensions = useExtensions({
        placeholder: isEdit ? "댓글을 수정하세요..." : "댓글을 입력하세요...",
    });

    useEffect(() => {
        if (!isEdit || !initialContent) return
        const t = window.setTimeout(() => {
            editorRef.current?.editor?.commands.setContent(initialContent)
        }, 0)
        return () => window.clearTimeout(t)
    }, [isEdit, initialContent, commentId])

    const handleSave = async () => {
        const editor = editorRef.current?.editor
        if (!editor || submitting) return
        if (isEdit && commentId == null) return

        setSubmitting(true)

        const content = editor.getJSON()

        try {
            if (isEdit) {
                await updateComment(commentId, { content })
            } else {
                await createComment(postId, { content })
            }
            if (!isEdit) {
                editor.commands.clearContent()
            }
            onSuccess?.()
        } catch (err) {
            console.error('❌ 댓글 저장 실패:', err)
            if (axios.isAxiosError(err)) {
                const status = err.response?.status
                if (status === 401) {
                    alert('로그인이 필요합니다.')
                } else if (status === 403) {
                    alert(isEdit ? '수정할 권한이 없습니다.' : '댓글을 작성할 권한이 없습니다.')
                } else {
                    alert(isEdit ? '수정 중 오류가 발생했습니다.' : '댓글 작성 중 오류가 발생했습니다.')
                }
            } else {
                alert('알 수 없는 오류가 발생했습니다.')
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Box
            className={`space-y-4 ${isEdit ? 'mt-2' : 'mt-6'}`}
            sx={{
                "& .ProseMirror": {
                    minHeight: isEdit ? '4vh' : '5vh',
                    padding: '1rem',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',

                    "& ol, & ul": {
                        paddingLeft: '1.5rem',
                        marginLeft: 0,
                    },
                },
            }}
        >
            <RichTextEditor
                key={isEdit ? `edit-comment-${commentId}` : 'new-comment'}
                ref={editorRef}
                extensions={extensions}
                renderControls={() => <EditorMenuControls />}
            />

            <div className="flex justify-end gap-2">
                {isEdit && onCancel && (
                    <Button variant="outlined" onClick={onCancel} disabled={submitting}>
                        취소
                    </Button>
                )}
                <Button
                    variant="contained"
                    onClick={() => void handleSave()}
                    disabled={submitting}
                >
                    {isEdit ? '수정 저장' : '댓글 달기'}
                </Button>
            </div>
        </Box>
    )
}
