import { OrderedList } from "@tiptap/extension-ordered-list";

export const BOARD_ORDERED_LIST_MAX_INDENT = 4;
export const BOARD_ORDERED_LIST_INDENT_STEP_EM = 1.5;

/** listIndent 1→a, 2→i, 3→1. (4단계) */
export function orderedListMarkerTypeForIndent(level: number): string | null {
    if (level <= 0) {
        return null;
    }
    const types = ["a", "i", "1", "a"] as const;
    return types[Math.min(level - 1, types.length - 1)] ?? "a";
}

/** orderedList — listIndent(들여쓰기) + type(번호 모양), 중첩 ol 없이 단독 a. 지원 */
const BoardOrderedList = OrderedList.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            listIndent: {
                default: 0,
                parseHTML: (element) => {
                    const raw = element.getAttribute("data-list-indent");
                    if (!raw) {
                        return 0;
                    }
                    const parsed = Number.parseInt(raw, 10);
                    return Number.isNaN(parsed) || parsed <= 0 ? 0 : parsed;
                },
                renderHTML: (attributes) => {
                    const level =
                        typeof attributes.listIndent === "number" && attributes.listIndent > 0
                            ? attributes.listIndent
                            : 0;
                    if (level <= 0) {
                        return {};
                    }
                    return {
                        "data-list-indent": String(level),
                        style: `margin-left: ${level * BOARD_ORDERED_LIST_INDENT_STEP_EM}em`,
                    };
                },
            },
        };
    },
});

export default BoardOrderedList;
