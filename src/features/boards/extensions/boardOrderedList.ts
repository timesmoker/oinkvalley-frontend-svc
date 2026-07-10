import { OrderedList } from "@tiptap/extension-ordered-list";

export const BOARD_ORDERED_LIST_MAX_INDENT = 4;
export const BOARD_ORDERED_LIST_INDENT_STEP_EM = 1.5;
export const BOARD_ORDERED_LIST_INDENT_BASE_OFFSET_REM = 0.2;

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
                        style: `margin-left: calc(${level * BOARD_ORDERED_LIST_INDENT_STEP_EM}em + ${BOARD_ORDERED_LIST_INDENT_BASE_OFFSET_REM}rem)`,
                    };
                },
            },
        };
    },
});

export default BoardOrderedList;
