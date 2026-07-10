import type { JSONContent } from "@tiptap/core";
import { buildHeadingId } from "@/features/boards/lib/headingId";

export type BoardTocItem = {
    id: string;
    textContent: string;
    level: number;
    /** 본문 hr(작은→큰 heading 사이) 직후 최상위 heading — 목차 위 여백 */
    spacingBefore?: boolean;
};

type RawTocItem =
    | { kind: "heading"; id: string; textContent: string; level: number }
    | { kind: "divider" };

function textFromNode(node: JSONContent): string {
    if (node.type === "text") {
        return node.text ?? "";
    }
    return (node.content ?? []).map(textFromNode).join("");
}

function walkHeadings(node: JSONContent, items: RawTocItem[], usedIds: Set<string>) {
    if (node.type === "heading") {
        const level = typeof node.attrs?.level === "number" ? node.attrs.level : 1;
        const textContent = textFromNode(node).trim();
        if (!textContent) {
            return;
        }

        const stored =
            typeof node.attrs?.id === "string"
                ? node.attrs.id.trim()
                : typeof node.attrs?.["data-toc-id"] === "string"
                  ? String(node.attrs["data-toc-id"]).trim()
                  : "";

        const id = stored || buildHeadingId(textContent, usedIds);
        items.push({ kind: "heading", id, textContent, level });
    }

    node.content?.forEach((child) => walkHeadings(child, items, usedIds));
}

function findAdjacentHeadingLevel(
    items: RawTocItem[],
    startIndex: number,
    direction: -1 | 1,
): number | null {
    for (
        let i = startIndex + direction;
        direction < 0 ? i >= 0 : i < items.length;
        i += direction
    ) {
        const item = items[i];
        if (item.kind === "heading") {
            return item.level;
        }
    }
    return null;
}

function getMinHeadingLevel(items: RawTocItem[]): number {
    const min = items.reduce((acc, item) => {
        if (item.kind === "heading") {
            return Math.min(acc, Math.max(1, item.level));
        }
        return acc;
    }, Number.POSITIVE_INFINITY);
    return Number.isFinite(min) ? min : 1;
}

function shouldShowTocSpacing(
    items: RawTocItem[],
    dividerIndex: number,
    minLevel: number,
): boolean {
    const prevLevel = findAdjacentHeadingLevel(items, dividerIndex, -1);
    const nextLevel = findAdjacentHeadingLevel(items, dividerIndex, 1);
    if (prevLevel === null || nextLevel === null) {
        return false;
    }
    if (prevLevel === nextLevel) {
        return false;
    }
    if (prevLevel < nextLevel) {
        return false;
    }
    if (nextLevel !== minLevel) {
        return false;
    }
    return true;
}

/** hr 조건 통과 시 divider 제거, 다음 heading(최상위만)에 spacingBefore 표시 */
function flattenTocItems(items: RawTocItem[]): BoardTocItem[] {
    const minLevel = getMinHeadingLevel(items);
    const result: BoardTocItem[] = [];
    let spacingBeforeNext = false;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "divider") {
            if (shouldShowTocSpacing(items, i, minLevel)) {
                spacingBeforeNext = true;
            }
            continue;
        }

        result.push({
            id: item.id,
            textContent: item.textContent,
            level: item.level,
            ...(spacingBeforeNext ? { spacingBefore: true } : {}),
        });
        spacingBeforeNext = false;
    }

    return result;
}

export function extractTocFromJson(content: JSONContent): BoardTocItem[] {
    const items: RawTocItem[] = [];
    const usedIds = new Set<string>();

    if (content.type === "doc") {
        content.content?.forEach((child) => {
            if (child.type === "horizontalRule") {
                items.push({ kind: "divider" });
                return;
            }
            walkHeadings(child, items, usedIds);
        });
    } else {
        walkHeadings(content, items, usedIds);
    }

    const flattened = flattenTocItems(items);
    return flattened.length > 0 ? flattened : [];
}
