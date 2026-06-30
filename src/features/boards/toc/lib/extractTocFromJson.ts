import type { JSONContent } from "@tiptap/core";
import { buildHeadingId } from "@/features/boards/lib/headingId";

export type BoardTocItem = {
    id: string;
    textContent: string;
    level: number;
};

function textFromNode(node: JSONContent): string {
    if (node.type === "text") {
        return node.text ?? "";
    }
    return (node.content ?? []).map(textFromNode).join("");
}

function walkHeadings(node: JSONContent, items: BoardTocItem[], usedIds: Set<string>) {
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
        items.push({ id, textContent, level });
    }

    node.content?.forEach((child) => walkHeadings(child, items, usedIds));
}

export function extractTocFromJson(content: JSONContent): BoardTocItem[] {
    const items: BoardTocItem[] = [];
    const usedIds = new Set<string>();

    if (content.type === "doc") {
        content.content?.forEach((child) => walkHeadings(child, items, usedIds));
    } else {
        walkHeadings(content, items, usedIds);
    }

    return items;
}
