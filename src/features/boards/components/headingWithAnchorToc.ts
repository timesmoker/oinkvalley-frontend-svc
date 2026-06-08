import { ReactNodeViewRenderer } from "@tiptap/react";
import { HeadingWithAnchor } from "mui-tiptap";
import HeadingWithAnchorTocComponent from "@/features/boards/components/HeadingWithAnchorTocComponent";

/** mui-tiptap HeadingWithAnchor + `attrs.id` from TableOfContents. */
const HeadingWithAnchorToc = HeadingWithAnchor.extend({
    addNodeView() {
        return ReactNodeViewRenderer(HeadingWithAnchorTocComponent);
    },
});

export default HeadingWithAnchorToc;
