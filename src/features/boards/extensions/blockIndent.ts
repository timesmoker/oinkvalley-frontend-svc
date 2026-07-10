import { Extension } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

/** Tab / Shift+Tab 블록 들여쓰기 — 최대 단계 */
export const BOARD_BLOCK_INDENT_MAX = 4;

/** 들여쓰기 1단계당 margin-left */
export const BOARD_BLOCK_INDENT_STEP_EM = 1.5;

const INDENTABLE_TYPES = ["paragraph", "heading", "blockquote"] as const;

const EXCLUDED_ANCESTOR_TYPES = new Set([
    "bulletList",
    "orderedList",
    "taskList",
    "listItem",
    "taskItem",
    "table",
    "tableRow",
    "tableCell",
    "tableHeader",
    "codeBlock",
    "details",
    "detailsSummary",
    "detailsContent",
]);

export function getBoardBlockIndentLevel(attrs: Record<string, unknown>): number {
    const indent = attrs.indent;
    if (typeof indent === "number" && Number.isFinite(indent) && indent > 0) {
        return Math.min(Math.floor(indent), BOARD_BLOCK_INDENT_MAX);
    }
    return 0;
}

export function boardBlockIndentMarginLeft(level: number): string | undefined {
    if (level <= 0) {
        return undefined;
    }
    return `${level * BOARD_BLOCK_INDENT_STEP_EM}em`;
}

function isInExcludedContext($from: { depth: number; node: (depth: number) => ProseMirrorNode }): boolean {
    for (let depth = $from.depth; depth > 0; depth--) {
        if (EXCLUDED_ANCESTOR_TYPES.has($from.node(depth).type.name)) {
            return true;
        }
    }
    return false;
}

function findOutermostIndentableBlock($from: {
    depth: number;
    node: (depth: number) => ProseMirrorNode;
    before: (depth: number) => number;
}) {
    if (isInExcludedContext($from)) {
        return null;
    }
    for (let depth = 1; depth <= $from.depth; depth++) {
        const node = $from.node(depth);
        if ((INDENTABLE_TYPES as readonly string[]).includes(node.type.name)) {
            return { node, pos: $from.before(depth) };
        }
    }
    return null;
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        blockIndent: {
            indentBlock: () => ReturnType;
            outdentBlock: () => ReturnType;
        };
    }
}

/** paragraph / heading / blockquote — Tab 들여쓰기, Shift+Tab 내어쓰기 */
const BlockIndent = Extension.create({
    name: "blockIndent",

    addOptions() {
        return {
            types: [...INDENTABLE_TYPES],
            maxLevel: BOARD_BLOCK_INDENT_MAX,
            stepEm: BOARD_BLOCK_INDENT_STEP_EM,
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    indent: {
                        default: 0,
                        parseHTML: (element) => {
                            const raw = element.getAttribute("data-indent");
                            if (raw) {
                                const parsed = Number.parseInt(raw, 10);
                                if (!Number.isNaN(parsed) && parsed > 0) {
                                    return Math.min(parsed, this.options.maxLevel);
                                }
                            }
                            const marginLeft = element.style.marginLeft;
                            const match = /^([\d.]+)em$/.exec(marginLeft);
                            if (match) {
                                const em = Number.parseFloat(match[1]);
                                const level = Math.round(em / this.options.stepEm);
                                if (level > 0) {
                                    return Math.min(level, this.options.maxLevel);
                                }
                            }
                            return 0;
                        },
                        renderHTML: (attributes) => {
                            const level = getBoardBlockIndentLevel(attributes);
                            if (level <= 0) {
                                return {};
                            }
                            return {
                                "data-indent": String(level),
                                style: `margin-left: ${level * this.options.stepEm}em`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            indentBlock:
                () =>
                ({ state, dispatch }) => {
                    const block = findOutermostIndentableBlock(state.selection.$from);
                    if (!block) {
                        return false;
                    }
                    const current = getBoardBlockIndentLevel(block.node.attrs);
                    if (current >= this.options.maxLevel) {
                        return false;
                    }
                    if (dispatch) {
                        const tr = state.tr.setNodeMarkup(block.pos, undefined, {
                            ...block.node.attrs,
                            indent: current + 1,
                        });
                        dispatch(tr);
                    }
                    return true;
                },
            outdentBlock:
                () =>
                ({ state, dispatch }) => {
                    const block = findOutermostIndentableBlock(state.selection.$from);
                    if (!block) {
                        return false;
                    }
                    const current = getBoardBlockIndentLevel(block.node.attrs);
                    if (current <= 0) {
                        return false;
                    }
                    if (dispatch) {
                        const tr = state.tr.setNodeMarkup(block.pos, undefined, {
                            ...block.node.attrs,
                            indent: current - 1,
                        });
                        dispatch(tr);
                    }
                    return true;
                },
        };
    },

});

export default BlockIndent;
