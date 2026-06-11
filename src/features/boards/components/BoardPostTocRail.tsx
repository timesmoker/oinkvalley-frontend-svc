"use client";

import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import BoardTableOfContents from "@/features/boards/components/BoardTableOfContents";
import { BOARD_POST_TOC_FIXED_SX } from "@/features/boards/lib/boardPostContentLayout";
import type { BoardTocItem } from "@/features/boards/lib/extractTocFromJson";

/** 게시글 본문 상자 밖 오른쪽 고정 목차 (xl 이상, BOARD_POST_TOC_FIXED_SX) */
export default function BoardPostTocRail({
    items,
    postTitle,
    anchorRef,
}: {
    items: BoardTocItem[];
    postTitle?: string;
    /** 목차 top을 맞출 요소 — Viewer/Editor 본문 래퍼에 연결 */
    anchorRef?: React.RefObject<HTMLElement | null>;
}) {
    const [top, setTop] = useState<number>(24);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const measure = () => {
            const el = anchorRef?.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            // 화면 안에 들어와 있을 때(초기 렌더 또는 스크롤 전)만 top 고정
            if (rect.top > 0) {
                setTop(Math.round(rect.top));
            }
        };

        measure();

        // ResizeObserver로 레이아웃 변화 감지
        const ro = new ResizeObserver(() => {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(measure);
        });
        if (anchorRef?.current) ro.observe(anchorRef.current);

        return () => {
            ro.disconnect();
            cancelAnimationFrame(rafRef.current);
        };
    }, [anchorRef]);

    if (items.length === 0) return null;

    return (
        <Box sx={{ ...BOARD_POST_TOC_FIXED_SX, top }}>
            <BoardTableOfContents items={items} postTitle={postTitle} variant="rail" />
        </Box>
    );
}
