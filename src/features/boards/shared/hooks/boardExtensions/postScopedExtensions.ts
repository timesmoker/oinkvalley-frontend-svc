import type { EditorOptions } from "@tiptap/core";
import TableOfContents, {
  getHierarchicalIndexes,
} from "@tiptap/extension-table-of-contents";
import NodeRange from "@tiptap/extension-node-range";
import { HeadingWithAnchor } from "mui-tiptap";
import HeadingWithAnchorToc from "@/features/boards/extensions/headingWithAnchorToc";
import { createTocHeadingIdAllocator } from "@/features/boards/lib/headingId";

type PostScopedExtensionsOptions = {
  isPost: boolean;
  isView: boolean;
  tocHeadingIds: Set<string>;
};

export function getPostScopedExtensions({
  isPost,
  isView,
  tocHeadingIds,
}: PostScopedExtensionsOptions): EditorOptions["extensions"] {
  if (!isPost) {
    return [HeadingWithAnchor];
  }

  return [
    TableOfContents.configure({
      getIndex: getHierarchicalIndexes,
      getId: createTocHeadingIdAllocator(tocHeadingIds),
      onUpdate: (data) => {
        tocHeadingIds.clear();
        for (const item of data) {
          tocHeadingIds.add(item.id);
        }
      },
    }),
    ...(isView ? [] : [NodeRange]),
    HeadingWithAnchorToc,
  ];
}
