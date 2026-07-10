import { mergeAttributes } from "@tiptap/core";
import { Image } from "@tiptap/extension-image";

export const BOARD_IMAGE_WRAPPER_ATTR = "data-board-image";

function parseImageTextAlign(element: Element): string {
  const wrapper = element.closest(`[${BOARD_IMAGE_WRAPPER_ATTR}]`);
  if (wrapper instanceof HTMLElement && wrapper.style.textAlign) {
    return wrapper.style.textAlign;
  }
  if (element instanceof HTMLElement && element.style.textAlign) {
    return element.style.textAlign;
  }
  return "center";
}

/**
 * Read-only viewer image — same attrs as ResizableImage, no React NodeView.
 * Avoids onLoad → updateAttributes → auto NodeSelection on page enter.
 *
 * 정렬은 에디터 NodeView와 같이 wrapper div 의 text-align 으로 처리한다.
 * (img 에 text-align / margin auto 는 mui-tiptap inline-flex 와 충돌)
 */
const BoardReadOnlyImage = Image.extend({
  name: "image",
  draggable: false,
  selectable: false,
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attributes) =>
          attributes.width ? { width: attributes.width } : {},
        parseHTML: (element) => element.getAttribute("width"),
      },
      aspectRatio: {
        default: null,
        renderHTML: (attributes) =>
          attributes.aspectRatio
            ? { style: `aspect-ratio: ${attributes.aspectRatio}` }
            : {},
        parseHTML: (element) => element.style.aspectRatio,
      },
      textAlign: {
        default: "center",
        renderHTML: () => ({}),
        parseHTML: parseImageTextAlign,
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: `div[${BOARD_IMAGE_WRAPPER_ATTR}] img[src]`,
        getAttrs: (node) => {
          if (!(node instanceof HTMLImageElement)) {
            return false;
          }
          return node.getAttribute("src") ? null : false;
        },
      },
      ...this.parent?.(),
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    const textAlign = node.attrs.textAlign || "center";
    return [
      "div",
      {
        [BOARD_IMAGE_WRAPPER_ATTR]: "",
        style: `text-align: ${textAlign}; width: 100%;`,
      },
      [
        "img",
        mergeAttributes(
          { height: "auto" },
          this.options.HTMLAttributes,
          HTMLAttributes,
        ),
      ],
    ];
  },
});

export default BoardReadOnlyImage;
