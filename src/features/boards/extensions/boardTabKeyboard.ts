import { Extension } from "@tiptap/core";
import { BOARD_ORDERED_LIST_MAX_INDENT } from "@/features/boards/extensions/boardOrderedList";
import {
    getOrderedListTypeAttr,
    normalizeOrderedMarkerType,
    resolveOrderedMarkerType,
} from "@/features/boards/extensions/boardOrderedMarker";
import {
    getListItemContext,
    isEmptyListItemNode,
    isInTabDelegateContext,
    isSelectionAtStartOfListItem,
} from "@/features/boards/extensions/boardTabListContext";

function getOrderedListIndent(attrs: Record<string, unknown>): number {
    const level = attrs.listIndent;
    if (typeof level === "number" && level > 0) {
        return Math.min(Math.floor(level), BOARD_ORDERED_LIST_MAX_INDENT);
    }
    return 0;
}

function resolveType(
    ctx: { hasParentOrderedList: boolean; parentOrderedListType: string | null },
    listIndent: number,
) {
    return resolveOrderedMarkerType({
        hasParentOrderedList: ctx.hasParentOrderedList,
        parentOrderedListType: ctx.parentOrderedListType,
        listIndent,
    });
}

function promoteOrderedIndent(
    state: import("@tiptap/pm/state").EditorState,
    dispatch: ((tr: import("@tiptap/pm/state").Transaction) => void) | undefined,
    onlyLeadingEmpty: boolean,
): boolean {
    const ctx = getListItemContext(state.selection.$from);
    if (!ctx || ctx.itemTypeName !== "listItem" || ctx.parentList.type.name !== "orderedList") return false;
    if (ctx.indexInParent !== 0) return false;

    const currentItem = ctx.parentList.child(ctx.indexInParent);
    if (onlyLeadingEmpty && !isEmptyListItemNode(currentItem)) return false;
    if (!onlyLeadingEmpty && isEmptyListItemNode(currentItem)) return false;

    const current = getOrderedListIndent(ctx.parentList.attrs);
    if (current >= BOARD_ORDERED_LIST_MAX_INDENT) return false;

    const nextIndent = current + 1;
    const nextType = resolveType(ctx, nextIndent);
    if (dispatch) {
        const tr = state.tr.setNodeMarkup(ctx.parentListPos, undefined, {
            ...ctx.parentList.attrs,
            listIndent: nextIndent,
            type: nextType,
        });
        dispatch(tr.scrollIntoView());
    }
    return true;
}

function demoteOrderedIndent(
    state: import("@tiptap/pm/state").EditorState,
    dispatch: ((tr: import("@tiptap/pm/state").Transaction) => void) | undefined,
    onlyLeadingEmpty: boolean,
): boolean {
    const ctx = getListItemContext(state.selection.$from);
    if (!ctx || ctx.itemTypeName !== "listItem" || ctx.parentList.type.name !== "orderedList") return false;
    if (ctx.indexInParent !== 0) return false;

    const currentItem = ctx.parentList.child(ctx.indexInParent);
    if (onlyLeadingEmpty && !isEmptyListItemNode(currentItem)) return false;

    const current = getOrderedListIndent(ctx.parentList.attrs);
    if (current <= 0) return false;

    const nextIndent = current - 1;
    const nextType = resolveType(ctx, nextIndent);
    if (dispatch) {
        const tr = state.tr.setNodeMarkup(ctx.parentListPos, undefined, {
            ...ctx.parentList.attrs,
            listIndent: nextIndent,
            type: nextType,
        });
        dispatch(tr.scrollIntoView());
    }
    return true;
}

function normalizeCurrentOrderedListType({
    state,
    dispatch,
}: {
    state: import("@tiptap/pm/state").EditorState;
    dispatch?: (tr: import("@tiptap/pm/state").Transaction) => void;
}): boolean {
    const ctx = getListItemContext(state.selection.$from);
    if (!ctx || ctx.parentList.type.name !== "orderedList") return false;

    const indent = getOrderedListIndent(ctx.parentList.attrs);
    const expectedType = resolveType(ctx, indent);
    const currentType = normalizeOrderedMarkerType(getOrderedListTypeAttr(ctx.parentList.attrs));
    if (currentType === expectedType) return false;

    if (dispatch) {
        const tr = state.tr.setNodeMarkup(ctx.parentListPos, undefined, {
            ...ctx.parentList.attrs,
            type: expectedType,
        });
        dispatch(tr);
    }
    return true;
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        boardTabKeyboard: {
            promoteSoleOrderedListMarker: () => ReturnType;
            demoteSoleOrderedListMarker: () => ReturnType;
            promoteEmptyLeadingOrderedListIndent: () => ReturnType;
            demoteEmptyLeadingOrderedListIndent: () => ReturnType;
            normalizeCurrentOrderedListType: () => ReturnType;
        };
    }
}

const BoardTabKeyboard = Extension.create({
    name: "boardTabKeyboard",
    priority: 1000,

    addCommands() {
        return {
            promoteSoleOrderedListMarker:
                () =>
                ({ state, dispatch }) =>
                    promoteOrderedIndent(state, dispatch, false),
            demoteSoleOrderedListMarker:
                () =>
                ({ state, dispatch }) =>
                    demoteOrderedIndent(state, dispatch, false),
            promoteEmptyLeadingOrderedListIndent:
                () =>
                ({ state, dispatch }) =>
                    promoteOrderedIndent(state, dispatch, true),
            demoteEmptyLeadingOrderedListIndent:
                () =>
                ({ state, dispatch }) =>
                    demoteOrderedIndent(state, dispatch, true),
            normalizeCurrentOrderedListType:
                () =>
                ({ state, dispatch }) =>
                    normalizeCurrentOrderedListType({ state, dispatch }),
        };
    },

    addKeyboardShortcuts() {
        return {
            Tab: () =>
                this.editor.commands.first(({ commands }) => [
                    () => {
                        if (isInTabDelegateContext(this.editor.state.selection.$from)) return false;
                        const ctx = getListItemContext(this.editor.state.selection.$from);
                        if (ctx) {
                            if (commands.sinkListItem(ctx.itemTypeName)) {
                                commands.normalizeCurrentOrderedListType();
                                return true;
                            }
                            if (commands.promoteEmptyLeadingOrderedListIndent()) return true;
                            if (commands.promoteSoleOrderedListMarker()) return true;
                            return true;
                        }
                        return commands.indentBlock();
                    },
                ]),
            "Shift-Tab": () =>
                this.editor.commands.first(({ commands }) => [
                    () => {
                        if (isInTabDelegateContext(this.editor.state.selection.$from)) return false;
                        const ctx = getListItemContext(this.editor.state.selection.$from);
                        if (ctx) {
                            if (commands.demoteEmptyLeadingOrderedListIndent()) return true;
                            if (commands.liftListItem(ctx.itemTypeName)) {
                                commands.normalizeCurrentOrderedListType();
                                return true;
                            }
                            if (commands.demoteSoleOrderedListMarker()) return true;
                            return true;
                        }
                        return commands.outdentBlock();
                    },
                ]),
            Backspace: () =>
                this.editor.commands.first(({ commands }) => [
                    () => {
                        if (isInTabDelegateContext(this.editor.state.selection.$from)) return false;
                        if (!isSelectionAtStartOfListItem(this.editor.state)) return false;

                        const ctx = getListItemContext(this.editor.state.selection.$from);
                        if (!ctx) return false;
                        if (!isEmptyListItemNode(ctx.parentList.child(ctx.indexInParent))) return false;
                        // 첫 항목만 커스텀 처리 — 2번째 이후 빈 항목은 기본 Backspace(이전 항목으로 병합)
                        if (ctx.indexInParent > 0) return false;

                        if (
                            ctx.itemTypeName === "listItem" &&
                            ctx.parentList.type.name === "orderedList" &&
                            commands.demoteSoleOrderedListMarker()
                        ) {
                            return true;
                        }
                        return commands.liftListItem(ctx.itemTypeName);
                    },
                ]),
        };
    },
});

export default BoardTabKeyboard;
