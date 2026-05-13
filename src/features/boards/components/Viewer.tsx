//src/components/board/Viewer.tsx
'use client'

import type { JSONContent } from '@tiptap/core'
import {
    RichTextReadOnly,
} from 'mui-tiptap';
import {Box} from '@mui/material'
import useExtensions from "./useExtensions"

export default function Viewer({
                                   content,
                                   proseminHeight,
                               }: {
    content: JSONContent
    proseminHeight?: string }) {
    const extensions = useExtensions()

    return (
        <Box
            sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',

                "& .ProseMirror": {
                    flex: 1,
                    height: '100%',
                    width: '100%',
                    ...(proseminHeight ? { minHeight: proseminHeight } : {}),
                    padding: '1rem',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',

                    "& ol, & ul": {
                        paddingLeft: '1.5rem',
                        marginLeft: 0,
                    },

                    "& h1, & h2, & h3, & h4, & h5, & h6": {
                        scrollMarginTop : 0,
                    },
                },
            }}
        >
            <RichTextReadOnly
                content={content}
                extensions={extensions}
            />
        </Box>

    )
}


