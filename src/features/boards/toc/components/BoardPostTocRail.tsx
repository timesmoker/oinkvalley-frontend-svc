"use client";

import { useLayoutEffect, useState } from "react";
import { Box } from "@mui/material";
import BoardTableOfContents from "@/features/boards/toc/components/BoardTableOfContents";
import { BOARD_POST_TOC_FIXED_SX } from "@/features/boards/shared/layout/boardPostLayoutConstants";
import { BOARD_EDITOR_MENU_BAR_STICKY_OFFSET_PX } from "@/features/boards/lib/boardEditorMenuBarSticky";
import {
    BOARD_POST_DOCUMENT_SHELL_ID,
    BOARD_POST_SCROLL_ANCHOR_ID,
} from "@/features/boards/lib/boardPostScrollAnchor";
import type { BoardTocItem } from "@/features/boards/toc/lib/extractTocFromJson";

const TOC_TITLE_ALIGN_OFFSET_PX = 8;
const TOC_MIN_TOP_GAP_PX = 12;

export default function BoardPostTocRail({ items }: { items: BoardTocItem[] }) {
    const [top, setTop] = useState<number>(BOARD_EDITOR_MENU_BAR_STICKY_OFFSET_PX);

    useLayoutEffect(() => {
        const syncTop = () => {
            const shell = document.getElementById(BOARD_POST_DOCUMENT_SHELL_ID);
            const anchor = document.getElementById(BOARD_POST_SCROLL_ANCHOR_ID);
            const base = anchor ?? shell;
            if (!base) return;
            const rect = base.getBoundingClientRect();
            const minTop = BOARD_EDITOR_MENU_BAR_STICKY_OFFSET_PX + TOC_MIN_TOP_GAP_PX;
            setTop(
                Math.max(
                    minTop,
                    Math.round(rect.top + TOC_TITLE_ALIGN_OFFSET_PX),
                ),
            );
        };

        syncTop();
        window.addEventListener("resize", syncTop);
        return () => {
            window.removeEventListener("resize", syncTop);
        };
    }, []);

    if (items.length === 0) return null;

    return (
        <Box
            sx={{
                ...BOARD_POST_TOC_FIXED_SX,
                top,
            }}
        >
            <BoardTableOfContents items={items} />
        </Box>
    );
}
