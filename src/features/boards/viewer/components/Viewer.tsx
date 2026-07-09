'use client'

import { useMemo, useRef } from 'react'
import type { JSONContent } from '@tiptap/core'
import {
    RichTextReadOnly,
} from 'mui-tiptap';
import {Box} from '@mui/material'
import useBoardExtensions from "@/features/boards/shared/hooks/useBoardExtensions"
import BoardPostTocRail from "@/features/boards/toc/components/BoardPostTocRail"
import BoardMobileTocPopover from "@/features/boards/toc/components/BoardMobileTocPopover"
import {
    boardPostArticleProsePaddingTop,
    boardPostViewerBodySx,
} from "@/features/boards/shared/layout/boardPostSurfaceStyles"
import { boardPostProseMirrorSx } from "@/features/boards/shared/layout/boardPostProseMirrorStyles"
import { proseMirrorReadOnlySelectionStyles } from "@/features/boards/lib/proseMirrorSelectionStyles"
import { extractTocFromJson } from "@/features/boards/toc/lib/extractTocFromJson"
import { useDetailsReadOnlyToggle } from "@/features/boards/viewer/hooks/useDetailsReadOnlyToggle"

export default function Viewer({
                                   content,
                                   postTitle,
                                   proseminHeight,
                                   showTableOfContents = false,
                                   embeddedInArticle = false,
                               }: {
    content: JSONContent
    postTitle?: string
    proseminHeight?: string
    /** 게시글 본문 전용 — 목차 사이드바 */
    showTableOfContents?: boolean
    /** 제목·메타와 같은 문단 컬럼 안 — 본문 상단 padding 제거 */
    embeddedInArticle?: boolean
}) {
    const extensions = useBoardExtensions({
        scope: showTableOfContents ? "post" : "comment",
        mode: "view",
    })
    const containerRef = useRef<HTMLDivElement>(null)
    useDetailsReadOnlyToggle(containerRef)
    const tocItems = useMemo(
        () => (showTableOfContents ? extractTocFromJson(content) : []),
        [content, showTableOfContents],
    )

    return (
        <>
            <Box
                sx={{
                    position: "relative",
                    width: "100%",
                }}
            >
                <BoardMobileTocPopover items={tocItems} />
                <Box
                    ref={containerRef}
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        ...(showTableOfContents ? boardPostViewerBodySx : {}),
                        ...proseMirrorReadOnlySelectionStyles,
                        "& .ProseMirror": {
                            flex: 1,
                            width: "100%",
                            ...(proseminHeight ? { minHeight: proseminHeight } : {}),
                            "& h1, & h2, & h3, & h4, & h5, & h6": {
                                scrollMarginTop: 0,
                            },
                            ...boardPostProseMirrorSx,
                            ...(embeddedInArticle
                                ? { paddingTop: boardPostArticleProsePaddingTop }
                                : {}),
                        },
                    }}
                >
                    <RichTextReadOnly content={content} extensions={extensions} />
                </Box>
            </Box>
            <BoardPostTocRail
                items={tocItems}
            />
        </>
    )
}

