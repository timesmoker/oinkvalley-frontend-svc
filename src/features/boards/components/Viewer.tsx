//src/components/board/Viewer.tsx
'use client'

import { useMemo, useRef } from 'react'
import type { JSONContent } from '@tiptap/core'
import {
    RichTextReadOnly,
} from 'mui-tiptap';
import {Box} from '@mui/material'
import useExtensions from "./useExtensions"
import BoardPostTocRail from "@/features/boards/components/BoardPostTocRail"
import BoardTableOfContents from "@/features/boards/components/BoardTableOfContents"
import {
    boardPostProseMirrorSx,
    boardPostViewerBodySx,
    BOARD_POST_TOC_INLINE_SX,
    BOARD_POST_TOC_INLINE_WRAP_SX,
} from "@/features/boards/lib/boardPostContentLayout"
import { extractTocFromJson } from "@/features/boards/lib/extractTocFromJson"
import { useDetailsReadOnlyToggle } from "@/features/boards/hooks/useDetailsReadOnlyToggle"

export default function Viewer({
                                   content,
                                   postTitle,
                                   proseminHeight,
                                   showTableOfContents = false,
                               }: {
    content: JSONContent
    postTitle?: string
    proseminHeight?: string
    /** 게시글 본문 전용 — 목차 사이드바 */
    showTableOfContents?: boolean
}) {
    const extensions = useExtensions({
        scope: showTableOfContents ? "post" : "comment",
    })
    const containerRef = useRef<HTMLDivElement>(null)
    useDetailsReadOnlyToggle(containerRef)
    const tocItems = useMemo(
        () => (showTableOfContents ? extractTocFromJson(content) : []),
        [content, showTableOfContents],
    )

    return (
        <>
            {/* xl 미만(우측 목차 숨김)에서만 본문 상단에 인라인 목차 표시 */}
            {tocItems.length > 0 && (
                <Box sx={BOARD_POST_TOC_INLINE_WRAP_SX}>
                    <Box sx={BOARD_POST_TOC_INLINE_SX}>
                        <BoardTableOfContents
                            items={tocItems}
                            postTitle={postTitle}
                            variant="inline"
                        />
                    </Box>
                </Box>
            )}
            <Box
                ref={containerRef}
                sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    ...(showTableOfContents ? boardPostViewerBodySx : {}),
                    "& .ProseMirror": {
                        flex: 1,
                        width: "100%",
                        ...(proseminHeight ? { minHeight: proseminHeight } : {}),
                        "& h1, & h2, & h3, & h4, & h5, & h6": {
                            scrollMarginTop: 0,
                        },
                        ...boardPostProseMirrorSx,
                    },
                }}
            >
                <RichTextReadOnly content={content} extensions={extensions} />
            </Box>
            <BoardPostTocRail
                items={tocItems}
                postTitle={postTitle}
                anchorRef={containerRef}
            />
        </>
    )
}


