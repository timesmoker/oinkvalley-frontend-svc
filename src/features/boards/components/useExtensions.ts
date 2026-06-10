import { Extension, type EditorOptions } from "@tiptap/core";
import { Blockquote } from "@tiptap/extension-blockquote";
import { Bold } from "@tiptap/extension-bold";
import { BulletList } from "@tiptap/extension-bullet-list";
import { Code } from "@tiptap/extension-code";
import { CodeBlock } from "@tiptap/extension-code-block";
import { Color } from "@tiptap/extension-color";
import { Document } from "@tiptap/extension-document";
import { Dropcursor } from "@tiptap/extension-dropcursor";
import { FontFamily } from "@tiptap/extension-font-family";
import { Gapcursor } from "@tiptap/extension-gapcursor";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Highlight } from "@tiptap/extension-highlight";
import { History } from "@tiptap/extension-history";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import { Italic } from "@tiptap/extension-italic";
import { Link } from "@tiptap/extension-link";
import { ListItem } from "@tiptap/extension-list-item";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Strike } from "@tiptap/extension-strike";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { Text } from "@tiptap/extension-text";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";
import Details from "@tiptap/extension-details";
import DetailsContent from "@tiptap/extension-details-content";
import DetailsSummary from "@tiptap/extension-details-summary";
import NodeRange from "@tiptap/extension-node-range";
import TableOfContents, {
  getHierarchicalIndexes,
  type TableOfContentData,
} from "@tiptap/extension-table-of-contents";
import { useMemo } from "react";
import {
  FontSize,
  HeadingWithAnchor,
  LinkBubbleMenuHandler,
  ResizableImage,
  TableImproved,
} from "mui-tiptap";
import HeadingWithAnchorToc from "@/features/boards/components/headingWithAnchorToc";
import BlockIndent from "@/features/boards/extensions/blockIndent";
import BoardOrderedList from "@/features/boards/extensions/boardOrderedList";
import BoardTabKeyboard from "@/features/boards/extensions/boardTabKeyboard";
import {
    BOARD_POST_HR_CLASS,
    boardHorizontalRuleInlineStyle,
} from "@/features/boards/lib/boardPostContentLayout";
import { createTocHeadingIdAllocator } from "@/features/boards/lib/headingId";

export type UseExtensionsOptions = {
  /** Placeholder hint to show in the text input area before a user types a message. */
  placeholder?: string;
  /** post: 드래그 핸들·목차·heading anchor id. comment: 본문 편집만 */
  scope?: "post" | "comment";
  /** TableOfContents extension — heading 목록 갱신 시 호출 (post 전용) */
  onTableOfContentsUpdate?: (data: TableOfContentData) => void;
};

// Don't treat the end cursor as "inclusive" of the Link mark, so that users can
// actually "exit" a link if it's the last element in the editor (see
// https://tiptap.dev/api/schema#inclusive and
// https://github.com/ueberdosis/tiptap/issues/2572#issuecomment-1055827817).
// This also makes the `isActive` behavior somewhat more consistent with
// `extendMarkRange` (as described here
// https://github.com/ueberdosis/tiptap/issues/2535), since a link won't be
// treated as active if the cursor is at the end of the link. One caveat of this
// approach: it seems that after creating or editing a link with the link menu
// (as opposed to having a link created via autolink), the next typed character
// will be part of the link unexpectedly, and subsequent characters will not be.
// This may have to do with how we're using `insertContent` and `setLink` in
// the LinkBubbleMenu, but I can't figure out an alternative approach that
// avoids the issue. This is arguably better than being "stuck" in the link
// without being able to leave it, but it is still not quite right. See the
// related open issues here:
// https://github.com/ueberdosis/tiptap/issues/2571,
// https://github.com/ueberdosis/tiptap/issues/2572, and
// https://github.com/ueberdosis/tiptap/issues/514
const CustomLinkExtension = Link.extend({
  inclusive: false,
});

// Make subscript and superscript mutually exclusive
// https://github.com/ueberdosis/tiptap/pull/1436#issuecomment-1031937768

const CustomSubscript = Subscript.extend({
  excludes: "superscript",
});

const CustomSuperscript = Superscript.extend({
  excludes: "subscript",
});

/** 빈 에디터 진입 시 paragraph에 textAlign=left 명시 (툴바 선택 상태) */
const DefaultTextAlignLeft = Extension.create({
  name: "defaultTextAlignLeft",
  onCreate() {
    const hasAlign = ["left", "center", "right", "justify"].some((alignment) =>
      this.editor.isActive({ textAlign: alignment }),
    );
    if (!hasAlign) {
      this.editor.commands.setTextAlign("left");
    }
  },
});

/**
 * Board ProseMirror extensions — node/mark contract SOT: {@code board/content-schema.json}.
 */
export default function useExtensions({
  placeholder,
  scope = "post",
  onTableOfContentsUpdate,
}: UseExtensionsOptions = {}): EditorOptions["extensions"] {
  return useMemo(() => {
    const tocHeadingIds = new Set<string>();
    const isPost = scope === "post";

    const postOnlyExtensions = isPost
      ? [
          TableOfContents.configure({
            getIndex: getHierarchicalIndexes,
            getId: createTocHeadingIdAllocator(tocHeadingIds),
            onUpdate: (data) => {
              tocHeadingIds.clear();
              for (const item of data) {
                tocHeadingIds.add(item.id);
              }
              onTableOfContentsUpdate?.(data);
            },
          }),
          NodeRange,
          HeadingWithAnchorToc,
        ]
      : [HeadingWithAnchor];

    const tableExtensions = isPost
      ? [
          TableImproved.configure({
            resizable: true,
          }),
          TableRow,
          TableHeader,
          TableCell,
        ]
      : [];

    const detailsExtensions = isPost
      ? [
          Details.configure({
            // open 상태는 저장하지 않음 — 편집 시 펼침, 뷰어 시 접힘
            persist: false,
          }),
          DetailsSummary,
          DetailsContent,
        ]
      : [];

    return [
      // We incorporate all of the functionality that's part of
      // https://tiptap.dev/api/extensions/starter-kit, plus a few additional
      // extensions, including mui-tiptap's

      // Note that the Table extension must come before other nodes that also have "tab"
      // shortcut keys so that when using the tab key within a table on a node that also
      // responds to that shortcut, it respects that inner node with higher precedence
      // than the Table. For instance, if you want to indent or dedent a list item
      // inside a table, you should be able to do that by pressing tab. Tab should only
      // move between table cells if not within such a nested node. See comment here for
      // notes on extension ordering
      // https://github.com/ueberdosis/tiptap/issues/1547#issuecomment-890848888, and
      // note in prosemirror-tables on the need to have these plugins be lower
      // precedence
      // https://github.com/ueberdosis/prosemirror-tables/blob/1a0428af3ca891d7db648ce3f08a2c74d47dced7/src/index.js#L26-L30
      ...tableExtensions,

      BulletList,
      CodeBlock,
      Document,
      HardBreak,
      ListItem,
      BoardOrderedList,
      Paragraph,
      CustomSubscript,
      CustomSuperscript,
      Text,

      // Blockquote must come after Bold, since we want the "Cmd+B" shortcut to
      // have lower precedence than the Blockquote "Cmd+Shift+B" shortcut.
      // Otherwise using "Cmd+Shift+B" will mistakenly toggle the bold mark.
      // (See https://github.com/ueberdosis/tiptap/issues/4005,
      // https://github.com/ueberdosis/tiptap/issues/4006)
      Bold,
      Blockquote,

      Code,
      Italic,
      Underline,
      Strike,
      CustomLinkExtension.configure({
        // autolink is generally useful for changing text into links if they
        // appear to be URLs (like someone types in literally "example.com"),
        // though it comes with the caveat that if you then *remove* the link
        // from the text, and then add a space or newline directly after the
        // text, autolink will turn the text back into a link again. Not ideal,
        // but probably still overall worth having autolink enabled, and that's
        // how a lot of other tools behave as well.
        autolink: true,
        linkOnPaste: true,
        openOnClick: false,
      }),
      LinkBubbleMenuHandler,

      ...detailsExtensions,
      ...postOnlyExtensions,

      // Extensions
      Gapcursor,
      TextAlign.configure({
        types: ["heading", "paragraph", "image"],
        defaultAlignment: "left",
      }),
      BlockIndent,
      DefaultTextAlignLeft,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      ...(isPost
        ? [
            HorizontalRule.configure({
              HTMLAttributes: {
                class: BOARD_POST_HR_CLASS,
                style: boardHorizontalRuleInlineStyle,
              },
            }),
          ]
        : []),

      ResizableImage,
      // When images are dragged, we want to show the "drop cursor" for where they'll
      // land
      Dropcursor,

      TaskList,
      TaskItem.configure({
        nested: true,
      }),

      Placeholder.configure({
        placeholder,
      }),

      // We use the regular `History` (undo/redo) extension when not using
      // collaborative editing
      History,

      // Tab — 목록 sink / 첫 항목 중첩 / 블록 들여쓰기 (표·코드·details Tab은 위임)
      BoardTabKeyboard,
    ];
  }, [placeholder, scope, onTableOfContentsUpdate]);
}
