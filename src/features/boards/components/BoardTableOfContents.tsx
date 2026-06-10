"use client";

import type { BoardTocItem } from "@/features/boards/lib/extractTocFromJson";
import { measureBoardPostScrollOffset } from "@/features/boards/lib/boardPostScrollAnchor";

function TocPostTitle({ title, variant }: { title: string; variant: "rail" | "inline" }) {
    const trimmed = title.trim();
    if (!trimmed) return null;

    if (variant === "rail") {
        return (
            <p className="font-semibold text-gray-800 mb-2 text-sm leading-snug line-clamp-3">
                {trimmed}
            </p>
        );
    }

    return (
        <p className="font-bold text-gray-800 mb-3 text-base leading-snug line-clamp-2">
            {trimmed}
        </p>
    );
}

function TocItemList({
    items,
    onSelect,
    divided,
}: {
    items: BoardTocItem[];
    onSelect: (id: string) => void;
    divided?: boolean;
}) {
    return (
        <ul className={divided ? "divide-y divide-gray-100" : "space-y-1"}>
            {items.map((item) => (
                <li
                    key={`${item.id}-${item.textContent}`}
                    style={{ paddingLeft: `${Math.max(0, item.level - 1) * 0.75}rem` }}
                >
                    <button
                        type="button"
                        onClick={() => onSelect(item.id)}
                        className={`text-left w-full text-gray-700 hover:text-blue-600 hover:underline leading-snug py-0.5 ${
                            divided ? "" : "truncate"
                        }`}
                    >
                        {item.textContent}
                    </button>
                </li>
            ))}
        </ul>
    );
}

export default function BoardTableOfContents({
    items,
    postTitle,
    variant = "rail",
}: {
    items: BoardTocItem[];
    postTitle?: string;
    /** rail: 우측 고정 사이드바, inline: 본문 상단 박스 */
    variant?: "rail" | "inline";
}) {
    if (items.length === 0) {
        return null;
    }

    const scrollToHeading = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        const targetViewportY = measureBoardPostScrollOffset();
        const y = el.getBoundingClientRect().top + window.scrollY - targetViewportY;
        window.scrollTo({ top: y, behavior: "smooth" });
    };

    const isInline = variant === "inline";

    return (
        <nav aria-label="목차" className="w-full text-left text-sm">
            {postTitle ? <TocPostTitle title={postTitle} variant={variant} /> : null}
            <p
                className={
                    isInline
                        ? "font-semibold text-gray-600 mb-1 pb-4 border-b border-gray-100"
                        : "font-semibold text-gray-600 mb-2"
                }
            >
                목차
            </p>
            <TocItemList items={items} onSelect={scrollToHeading} divided={isInline} />
        </nav>
    );
}
