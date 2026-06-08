import { Extension } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import {
    BOARD_ORDERED_LIST_MAX_INDENT,
    orderedListMarkerTypeForIndent,
} from "@/features/boards/extensions/boardOrderedList";

/** 표·코드·details — Tab은 기존 동작 유지 */
const TAB_DELEGATE_CONTEXT = new Set([
    "table",
    "tableRow",
    "tableCell",
    "tableHeader",
    "codeBlock",
    "details",
    "detailsSummary",
    "detailsContent",
]);

function isInTabDelegateContext($from: { depth: number; node: (depth: number) => ProseMirrorNode }): boolean {
    for (let depth = $from.depth; depth > 0; depth--) {
        if (TAB_DELEGATE_CONTEXT.has($from.node(depth).type.name)) {
            return true;
        }
    }
    return false;
}

function getListItemContext($from: {
    depth: number;
    node: (depth: number) => ProseMirrorNode;
    before: (depth: number) => number;
    index: (depth: number) => number;
}) {
    for (let depth = $from.depth; depth > 0; depth--) {
        const name = $from.node(depth).type.name;
        if (name === "listItem" || name === "taskItem") {
            return {
                itemTypeName: name,
                parentList: $from.node(depth - 1),
                parentListPos: $from.before(depth - 1),
                indexInParent: $from.index(depth - 1),
            };
        }
    }
    return null;
}

function getOrderedListIndent(attrs: Record<string, unknown>): number {
    const level = attrs.listIndent;
    if (typeof level === "number" && level > 0) {
        return Math.min(Math.floor(level), BOARD_ORDERED_LIST_MAX_INDENT);
    }
    return 0;
}

/**
 * sink 불가한 단독 1. — 중첩 ol 없이 번호만 a.+들여쓰기로 변경.
 * (2. 항목 Tab → sinkListItem 으로 1. 아래 a. 는 기존 동작)
 */
function promoteSoleOrderedListMarker({
    state,
    dispatch,
}: {
    state: import("@tiptap/pm/state").EditorState;
    dispatch?: (tr: import("@tiptap/pm/state").Transaction) => void;
}): boolean {
    const ctx = getListItemContext(state.selection.$from);
    if (!ctx || ctx.itemTypeName !== "listItem") {
        return false;
    }
    if (ctx.parentList.type.name !== "orderedList") {
        return false;
    }
    if (ctx.indexInParent !== 0 || ctx.parentList.childCount !== 1) {
        return false;
    }

    const current = getOrderedListIndent(ctx.parentList.attrs);
    if (current >= BOARD_ORDERED_LIST_MAX_INDENT) {
        return false;
    }

    const next = current + 1;
    if (dispatch) {
        const tr = state.tr.setNodeMarkup(ctx.parentListPos, undefined, {
            ...ctx.parentList.attrs,
            listIndent: next,
            type: orderedListMarkerTypeForIndent(next),
        });
        dispatch(tr.scrollIntoView());
    }
    return true;
}

function demoteSoleOrderedListMarker({
    state,
    dispatch,
}: {
    state: import("@tiptap/pm/state").EditorState;
    dispatch?: (tr: import("@tiptap/pm/state").Transaction) => void;
}): boolean {
    const ctx = getListItemContext(state.selection.$from);
    if (!ctx || ctx.itemTypeName !== "listItem") {
        return false;
    }
    if (ctx.parentList.type.name !== "orderedList") {
        return false;
    }
    if (ctx.indexInParent !== 0 || ctx.parentList.childCount !== 1) {
        return false;
    }

    const current = getOrderedListIndent(ctx.parentList.attrs);
    if (current <= 0) {
        return false;
    }

    const next = current - 1;
    if (dispatch) {
        const tr = state.tr.setNodeMarkup(ctx.parentListPos, undefined, {
            ...ctx.parentList.attrs,
            listIndent: next,
            type: orderedListMarkerTypeForIndent(next),
        });
        dispatch(tr.scrollIntoView());
    }
    return true;
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        boardTabKeyboard: {
            promoteSoleOrderedListMarker: () => ReturnType;
            demoteSoleOrderedListMarker: () => ReturnType;
        };
    }
}

/**
 * Tab / Shift+Tab — 목록 sink/lift 우선, 단독 1. 은 a. 로 승격(중첩 생성 없음).
 */
const BoardTabKeyboard = Extension.create({
    name: "boardTabKeyboard",
    priority: 1000,

    addCommands() {
        return {
            promoteSoleOrderedListMarker:
                () =>
                ({ state, dispatch }) =>
                    promoteSoleOrderedListMarker({ state, dispatch }),
            demoteSoleOrderedListMarker:
                () =>
                ({ state, dispatch }) =>
                    demoteSoleOrderedListMarker({ state, dispatch }),
        };
    },

    addKeyboardShortcuts() {
        return {
            Tab: () =>
                this.editor.commands.first(({ commands }) => [
                    () => {
                        if (isInTabDelegateContext(this.editor.state.selection.$from)) {
                            return false;
                        }
                        const ctx = getListItemContext(this.editor.state.selection.$from);
                        if (ctx) {
                            const itemName = ctx.itemTypeName;
                            if (commands.sinkListItem(itemName)) {
                                return true;
                            }
                            if (commands.promoteSoleOrderedListMarker()) {
                                return true;
                            }
                            return true;
                        }
                        return commands.indentBlock();
                    },
                ]),
            "Shift-Tab": () =>
                this.editor.commands.first(({ commands }) => [
                    () => {
                        if (isInTabDelegateContext(this.editor.state.selection.$from)) {
                            return false;
                        }
                        const ctx = getListItemContext(this.editor.state.selection.$from);
                        if (ctx) {
                            if (commands.liftListItem(ctx.itemTypeName)) {
                                return true;
                            }
                            if (commands.demoteSoleOrderedListMarker()) {
                                return true;
                            }
                            return true;
                        }
                        return commands.outdentBlock();
                    },
                ]),
        };
    },
});

export default BoardTabKeyboard;
