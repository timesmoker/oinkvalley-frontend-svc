"use client";

import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import BoardTableOfContents from "@/features/boards/toc/components/BoardTableOfContents";
import type { BoardTocItem } from "@/features/boards/toc/lib/extractTocFromJson";

export default function BoardMobileTocPopover({ items }: { items: BoardTocItem[] }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event: PointerEvent) => {
            const root = rootRef.current;
            if (!root || root.contains(event.target as Node)) return;
            setOpen(false);
        };

        document.addEventListener("pointerdown", handlePointerDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
        };
    }, [open]);

    if (items.length === 0) return null;

    return (
        <Box
            ref={rootRef}
            sx={{
                display: { xs: "block", xl: "none" },
                position: "fixed",
                top: "calc(var(--site-header-height, 56px) * 2 + var(--site-header-hidden-offset, 0px) + 12px)",
                right: 16,
                zIndex: 1200,
                transition: "top 200ms ease",
            }}
        >
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-label="목차 열기"
                aria-expanded={open}
                className="flex h-9 items-center justify-center rounded-full border border-gray-300 bg-white px-3 text-sm font-bold text-black shadow-sm"
            >
                목차
            </button>
            {open && (
                <Box
                    sx={{
                        position: "absolute",
                        top: "calc(100% + 0.5rem)",
                        right: 0,
                        width: "max-content",
                        maxWidth: "calc(100vw - 2rem)",
                        overflowX: "auto",
                        p: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        backgroundColor: "grey.50",
                        boxShadow: 3,
                    }}
                >
                    <BoardTableOfContents
                        items={items}
                        fontSizeOffsetPx={-1}
                        onNavigate={() => setOpen(false)}
                    />
                </Box>
            )}
        </Box>
    );
}
