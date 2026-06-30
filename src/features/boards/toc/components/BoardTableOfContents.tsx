"use client";

import type { BoardTocItem } from "@/features/boards/toc/lib/extractTocFromJson";
import { getBoardPostHeadingScrollTop } from "@/features/boards/lib/boardPostScrollAnchor";

function TocItemList({
    items,
    onSelect,
}: {
    items: BoardTocItem[];
    onSelect: (id: string) => void;
}) {
    const minLevel = items.reduce(
        (min, item) => Math.min(min, Math.max(1, item.level)),
        Number.POSITIVE_INFINITY,
    );
    const baseLevel = Number.isFinite(minLevel) ? minLevel : 1;

    return (
        <ul className="space-y-1">
            {items.map((item) => (
                <li
                    key={`${item.id}-${item.textContent}`}
                    style={{
                        paddingLeft: `${Math.max(0, Math.max(1, item.level) - baseLevel) * 0.625}rem`,
                    }}
                >
                    <button
                        type="button"
                        onClick={() => onSelect(item.id)}
                        className="text-left w-full text-gray-700 hover:text-blue-600 hover:underline leading-snug py-0.5 break-words"
                    >
                        {item.textContent}
                    </button>
                </li>
            ))}
        </ul>
    );
}

export default function BoardTableOfContents({ items }: { items: BoardTocItem[] }) {
    if (items.length === 0) {
        return null;
    }

    const scrollToHeading = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        const y = getBoardPostHeadingScrollTop(el);
        window.scrollTo({ top: y, behavior: "smooth" });
    };

    return (
        <nav aria-label="목차" className="w-full text-left text-sm">
            <p className="font-semibold text-gray-600 mb-2">목차</p>
            <TocItemList items={items} onSelect={scrollToHeading} />
        </nav>
    );
}
