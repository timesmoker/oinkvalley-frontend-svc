"use client";

import { useLayoutEffect, useState } from "react";
import type { RefObject } from "react";
import { Box } from "@mui/material";
import type { Editor } from "@tiptap/core";
import { RichTextEditorProvider } from "mui-tiptap";
import EditorMenuControls from "@/features/boards/editor/components/EditorMenuControls";
import { BOARD_EDITOR_MENU_BAR_STICKY_OFFSET_PX } from "@/features/boards/lib/boardEditorMenuBarSticky";
import { BOARD_EDITOR_SIDE_TOOLBAR_FIXED_SX } from "@/features/boards/lib/boardEditorToolbarLayout";
import { useBoardEditorToolbarContext } from "@/features/boards/editor/context/BoardEditorToolbarContext";

/** 게시글 본문 박스 왼쪽 밖 고정 툴바 (우측 목차와 대칭) */
export default function BoardEditorSideToolbar({
    editor,
    anchorRef,
}: {
    editor: Editor | null;
    /** 에디터 박스 — 최초 1회 상단 정렬 기준 */
    anchorRef?: RefObject<HTMLElement | null>;
}) {
    const [top, setTop] = useState<number | null>(null);
    const { setToolbarElement } = useBoardEditorToolbarContext();

    useLayoutEffect(() => {
        const el = anchorRef?.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        setTop(
            Math.max(
                BOARD_EDITOR_MENU_BAR_STICKY_OFFSET_PX,
                Math.round(rect.top),
            ),
        );
    }, [anchorRef]);

    if (!editor || top === null) return null;

    return (
        <RichTextEditorProvider editor={editor}>
            <Box
                ref={(el) => {
                    setToolbarElement(el instanceof HTMLElement ? el : null);
                }}
                sx={{ ...BOARD_EDITOR_SIDE_TOOLBAR_FIXED_SX, top }}
            >
                <EditorMenuControls orientation="vertical" />
            </Box>
        </RichTextEditorProvider>
    );
}
