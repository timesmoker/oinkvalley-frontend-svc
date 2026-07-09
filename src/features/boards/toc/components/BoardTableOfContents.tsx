"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { BoardTocItem } from "@/features/boards/toc/lib/extractTocFromJson";
import { getBoardPostHeadingScrollTop } from "@/features/boards/lib/boardPostScrollAnchor";

const TOC_BASE_FONT_SIZE_PX = 14.5;
const TOC_FONT_SIZE_STEP_PX = 0.25;
const TOC_MIN_FONT_SIZE_PX = 10.5;
const TOC_LEADER_DOTS = "· ".repeat(120);
/** 가장 긴 항목 텍스트 끝 + 점선 여유 (우측 레일) */
const TOC_WIDTH_EXTRA_CH = 3;
const TOC_INDENT_REM = 0.625;

function getTocItemDepth(item: BoardTocItem, baseLevel: number) {
    return Math.max(0, Math.max(1, item.level) - baseLevel);
}

function getTocItemFontSize(depth: number, fontSizeOffsetPx: number) {
    return Math.max(
        TOC_BASE_FONT_SIZE_PX - depth * TOC_FONT_SIZE_STEP_PX + fontSizeOffsetPx,
        TOC_MIN_FONT_SIZE_PX + fontSizeOffsetPx,
    );
}

function TocItemList({
    id,
    items,
    onSelect,
    fillWidth,
    fontSizeOffsetPx,
}: {
    id?: string;
    items: BoardTocItem[];
    onSelect: (id: string) => void;
    fillWidth: boolean;
    fontSizeOffsetPx: number;
}) {
    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [listWidth, setListWidth] = useState<string | undefined>(undefined);

    const minLevel = items.reduce(
        (min, item) => Math.min(min, Math.max(1, item.level)),
        Number.POSITIVE_INFINITY,
    );
    const baseLevel = Number.isFinite(minLevel) ? minLevel : 1;

    useLayoutEffect(() => {
        if (fillWidth) {
            setListWidth(undefined);
            return;
        }

        const measure = () => {
            const rootFontSize =
                parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
            let maxTextWidthPx = 0;

            items.forEach((item, index) => {
                const button = buttonRefs.current[index];
                if (!button) return;

                const depth = getTocItemDepth(item, baseLevel);
                const paddingLeftPx = depth * TOC_INDENT_REM * rootFontSize;
                maxTextWidthPx = Math.max(
                    maxTextWidthPx,
                    paddingLeftPx + button.offsetWidth,
                );
            });

            if (maxTextWidthPx > 0) {
                setListWidth(`calc(${Math.ceil(maxTextWidthPx)}px + ${TOC_WIDTH_EXTRA_CH}ch)`);
            }
        };

        measure();
        window.addEventListener("resize", measure);
        return () => {
            window.removeEventListener("resize", measure);
        };
    }, [items, baseLevel, fillWidth]);

    return (
        <ul
            id={id}
            className="space-y-0.5"
            style={!fillWidth && listWidth ? { width: listWidth } : undefined}
        >
            {items.map((item, index) => {
                const depth = getTocItemDepth(item, baseLevel);
                const fontSize = getTocItemFontSize(depth, fontSizeOffsetPx);

                return (
                    <li
                        key={`${item.id}-${item.textContent}`}
                        className={`w-full${item.spacingBefore ? " mt-1.5" : ""}`}
                        style={{
                            paddingLeft: `${depth * TOC_INDENT_REM}rem`,
                        }}
                    >
                        <div className="flex w-full items-baseline">
                            <button
                                ref={(el) => {
                                    buttonRefs.current[index] = el;
                                }}
                                type="button"
                                onClick={() => onSelect(item.id)}
                                className={`shrink-0 text-left text-black hover:underline leading-snug py-0.5 whitespace-nowrap${depth === 0 ? " font-bold" : ""}`}
                                style={{ fontSize: `${fontSize}px` }}
                            >
                                {item.textContent}
                            </button>
                            <span
                                aria-hidden="true"
                                className="mx-1 min-w-0 flex-1 overflow-hidden whitespace-nowrap text-gray-400 leading-snug"
                                style={{ fontSize: `${fontSize}px` }}
                            >
                                {TOC_LEADER_DOTS}
                            </span>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

export default function BoardTableOfContents({
    items,
    fillWidth = false,
    collapsible = false,
    onNavigate,
    fontSizeOffsetPx = 0,
}: {
    items: BoardTocItem[];
    /** xl 미만 인라인 — 컨테이너 전체 너비, 점선 오른쪽 끝까지 */
    fillWidth?: boolean;
    collapsible?: boolean;
    onNavigate?: () => void;
    fontSizeOffsetPx?: number;
}) {
    const [open, setOpen] = useState(false);

    if (items.length === 0) {
        return null;
    }

    const scrollToHeading = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        const y = getBoardPostHeadingScrollTop(el);
        window.scrollTo({ top: y, behavior: "smooth" });
        if (fillWidth && collapsible) {
            setOpen(false);
        }
        onNavigate?.();
    };

    const listId = "board-post-toc-list";
    const shouldShowToggle = fillWidth && collapsible;

    return (
        <nav
            aria-label="목차"
            className={`text-left pl-[1ch]${fillWidth ? " w-full max-w-full" : " w-max max-w-none"}`}
        >
            {shouldShowToggle ? (
                <button
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    aria-expanded={open}
                    aria-controls={listId}
                    className="mb-2 flex w-full items-center gap-1 text-left font-semibold text-black"
                    style={{ fontSize: `${TOC_BASE_FONT_SIZE_PX + fontSizeOffsetPx}px` }}
                >
                    목차
                    <span aria-hidden="true" className="text-xs text-gray-500">
                        {open ? "▲" : "▼"}
                    </span>
                </button>
            ) : (
                <p
                    className="mb-2 text-left font-semibold text-black"
                    style={{ fontSize: `${TOC_BASE_FONT_SIZE_PX + fontSizeOffsetPx}px` }}
                >
                    목차
                </p>
            )}
            {(!shouldShowToggle || open) && (
                <TocItemList
                    id={fillWidth ? listId : undefined}
                    items={items}
                    onSelect={scrollToHeading}
                    fillWidth={fillWidth}
                    fontSizeOffsetPx={fontSizeOffsetPx}
                />
            )}
        </nav>
    );
}
