import { mergeAttributes } from "@tiptap/core";
import { Image } from "@tiptap/extension-image";

/**
 * Read-only viewer image — same attrs as ResizableImage, no React NodeView.
 * Avoids onLoad → updateAttributes → auto NodeSelection on page enter.
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
      /* TextAlign 글로벌(default left)을 덮어 이미지만 기본 center */
      textAlign: {
        default: "center",
        renderHTML: (attributes) =>
          attributes.textAlign
            ? { style: `text-align: ${attributes.textAlign}` }
            : {},
        parseHTML: (element) => element.style.textAlign || "center",
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "img",
      mergeAttributes({ height: "auto" }, this.options.HTMLAttributes, HTMLAttributes),
    ];
  },
});

export default BoardReadOnlyImage;
