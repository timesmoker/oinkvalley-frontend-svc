// src/components/boards/Comments.tsx
'use client'

import { useState } from 'react'
import CommentEditor from './CommentEditor'
import CommentList from './CommentList'

export default function Comments({ postId }: { postId: string }) {
    const [refreshKey, setRefreshKey] = useState(0)

    return (
        <div className="w-full space-y-6">
            <CommentEditor
                postId={postId}
                onSuccess={() => setRefreshKey((k) => k + 1)}
            />
            <CommentList
                postId={postId}
                refreshKey={refreshKey}
                onRefresh={() => setRefreshKey((k) => k + 1)}
            />
        </div>
    )
}
