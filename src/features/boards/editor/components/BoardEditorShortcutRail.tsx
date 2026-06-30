"use client";

import { useLayoutEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import {
    BOARD_EDITOR_SHORTCUT_RAIL_FIXED_SX,
    BOARD_EDITOR_SHORTCUT_TOP_RATIO,
} from "@/features/boards/lib/boardEditorToolbarLayout";
import { useBoardEditorToolbarContext } from "@/features/boards/editor/context/BoardEditorToolbarContext";

/** 게시글 에디터 단축키 안내 — 좌측 고정 패널(모바일 숨김) */
export default function BoardEditorShortcutRail() {
    const [top, setTop] = useState<number>(0);
    const { toolbarElement } = useBoardEditorToolbarContext();

    useLayoutEffect(() => {
        const toolbar = toolbarElement;
        if (!toolbar) return;

        const syncTop = () => {
            const rect = toolbar.getBoundingClientRect();
            setTop(Math.round(rect.top + rect.height * BOARD_EDITOR_SHORTCUT_TOP_RATIO));
        };

        syncTop();
        const observer = new ResizeObserver(syncTop);
        observer.observe(toolbar);
        window.addEventListener("resize", syncTop);

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", syncTop);
        };
    }, [toolbarElement]);

    return (
        <Box
            sx={{
                ...BOARD_EDITOR_SHORTCUT_RAIL_FIXED_SX,
                top: top > 0 ? `${top}px` : BOARD_EDITOR_SHORTCUT_RAIL_FIXED_SX.top,
                transform: "none",
            }}
        >
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, mb: 0.75 }}>
                단축키
            </Typography>
            <Box sx={{ display: "grid", rowGap: 0.5, fontSize: "0.75rem", color: "text.secondary" }}>
                <div>제목: Ctrl+Alt+1~6</div>
                <div>굵게: Ctrl+B</div>
                <div>기울임: Ctrl+I</div>
                <div>링크: Ctrl+K</div>
                <div>리스트 탭: Tab / Shift+Tab</div>
            </Box>
        </Box>
    );
}
