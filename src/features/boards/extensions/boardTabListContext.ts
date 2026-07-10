import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { getOrderedListTypeAttr } from "@/features/boards/extensions/boardOrderedMarker";

export const TAB_DELEGATE_CONTEXT = new Set([
    "table",
    "tableRow",
    "tableCell",
    "tableHeader",
    "codeBlock",
    "details",
    "detailsSummary",
    "detailsContent",
]);

export function isInTabDelegateContext($from: {
    depth: number;
    node: (depth: number) => ProseMirrorNode;
}): boolean {
    for (let depth = $from.depth; depth > 0; depth--) {
        if (TAB_DELEGATE_CONTEXT.has($from.node(depth).type.name)) {
            return true;
        }
    }
    return false;
}

export function isEmptyListItemNode(node: ProseMirrorNode): boolean {
    return node.textContent.trim().length === 0;
}

export function isSelectionAtStartOfListItem(state: import("@tiptap/pm/state").EditorState): boolean {
    const { selection } = state;
    if (!selection.empty) {
        return false;
    }
    return selection.$from.parentOffset === 0;
}

export type ListItemContext = {
    itemTypeName: string;
    parentList: ProseMirrorNode;
    parentListPos: number;
    indexInParent: number;
    hasParentOrderedList: boolean;
    parentOrderedListType: string | null;
};

export function getListItemContext($from: {
    depth: number;
    node: (depth: number) => ProseMirrorNode;
    before: (depth: number) => number;
    index: (depth: number) => number;
}): ListItemContext | null {
    for (let depth = $from.depth; depth > 0; depth--) {
        const name = $from.node(depth).type.name;
        if (name === "listItem" || name === "taskItem") {
            let parentOrderedListType: string | null = null;
            let hasParentOrderedList = false;
            for (let parentDepth = depth - 2; parentDepth > 0; parentDepth--) {
                if ($from.node(parentDepth).type.name === "orderedList") {
                    hasParentOrderedList = true;
                    parentOrderedListType = getOrderedListTypeAttr(
                        $from.node(parentDepth).attrs as Record<string, unknown>,
                    );
                    break;
                }
            }
            return {
                itemTypeName: name,
                parentList: $from.node(depth - 1),
                parentListPos: $from.before(depth - 1),
                indexInParent: $from.index(depth - 1),
                hasParentOrderedList,
                parentOrderedListType,
            };
        }
    }
    return null;
}
