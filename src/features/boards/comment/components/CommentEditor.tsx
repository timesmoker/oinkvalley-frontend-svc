'use client'

import { useEffect, useRef, useState } from 'react'
import { Box, Button } from '@mui/material'
import type { JSONContent } from '@tiptap/core'
import {
    RichTextEditor,
    type RichTextEditorRef,
} from 'mui-tiptap'
import axios from 'axios'
import EditorMenuControls from "@/features/boards/editor/components/EditorMenuControls";
import useBoardExtensions from "@/features/boards/shared/hooks/useBoardExtensions";
import { proseMirrorBlockSpacingStyles } from "@/features/boards/shared/layout/boardPostProseMirrorStyles";
import { createComment, updateComment } from "@/features/boards/api/boardMutations";

export default function CommentEditor({
    postId,
    commentId,
    parentCommentId,
    replyLabel,
    fullSize,
    initialContent,
    onCancel,
    onSuccess,
}: {
    postId: string
    /** 있으면 수정 모드 — `PUT /comments/{commentId}` */
    commentId?: number
    /** 답글 대상. 최상위 작성 시 생략 */
    parentCommentId?: number | null
    replyLabel?: string | null
    /** 최상위 댓글창과 같은 크기 */
    fullSize?: boolean
    initialContent?: JSONContent
    onCancel?: () => void
    onSuccess?: () => void
}) {
    const isEdit = commentId != null
    const isReply = !isEdit && parentCommentId != null
    const useFullComposer = fullSize || (!isEdit && !isReply)
    const editorRef = useRef<RichTextEditorRef>(null)
    const [submitting, setSubmitting] = useState(false)
    const extensions = useBoardExtensions({
        placeholder: isEdit
            ? "댓글을 수정하세요..."
            : isReply
              ? "답글을 입력하세요..."
              : "댓글을 입력하세요...",
        scope: "comment",
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
                await createComment(postId, {
                    content,
                    ...(parentCommentId != null ? { parentCommentId } : {}),
                })
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
            className={`space-y-2 ${isEdit || isReply ? 'mt-1' : 'mt-3'}`}
            sx={{
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                padding: useFullComposer ? "0.75rem" : "0.5rem",
                backgroundColor: "#fff !important",
                "& .MuiTiptap-RichTextField-root": {
                    backgroundColor: "#fff",
                },
                "& .MuiTiptap-RichTextContent-root": {
                    backgroundColor: "#fff",
                },
                "& .ProseMirror": {
                    minHeight: useFullComposer ? '5vh' : isEdit ? '3vh' : '4vh',
                    padding: useFullComposer ? '0.75rem 0.25rem' : '0.35rem 0.15rem',
                    border: 'none',
                    borderRadius: 0,
                    backgroundColor: "#fff",
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                    ...proseMirrorBlockSpacingStyles,
                    "& ol, & ul": {
                        paddingLeft: '1.5rem',
                        marginLeft: 0,
                    },
                },
                "& .MuiTiptap-FieldContainer-notchedOutline": {
                    border: "none !important",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                    border: "none !important",
                },
            }}
        >
            {replyLabel && (
                <p className="text-sm text-gray-600">{replyLabel}</p>
            )}
            <RichTextEditor
                key={
                    isEdit
                        ? `edit-comment-${commentId}`
                        : isReply
                          ? `reply-${parentCommentId}`
                          : 'new-comment'
                }
                ref={editorRef}
                extensions={extensions}
                RichTextFieldProps={{ variant: "standard" }}
                renderControls={() => <EditorMenuControls scope="comment" />}
            />

            <div className="flex justify-end gap-2">
                {(isEdit || isReply) && onCancel && (
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={onCancel}
                        disabled={submitting}
                    >
                        취소
                    </Button>
                )}
                <Button
                    size="small"
                    variant="contained"
                    onClick={() => void handleSave()}
                    disabled={submitting}
                >
                    {isEdit ? '수정 저장' : isReply ? '답글 달기' : '댓글 달기'}
                </Button>
            </div>
        </Box>
    )
}
