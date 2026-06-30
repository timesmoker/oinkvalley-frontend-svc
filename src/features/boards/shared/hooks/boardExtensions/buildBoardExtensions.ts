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
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { Text } from "@tiptap/extension-text";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";
import {
  FontSize,
  LinkBubbleMenuHandler,
} from "mui-tiptap";
import BlockIndent from "@/features/boards/extensions/blockIndent";
import BoardImagePaste from "@/features/boards/extensions/boardImagePaste";
import BoardOrderedList from "@/features/boards/extensions/boardOrderedList";
import BoardReadOnlyImage from "@/features/boards/extensions/boardReadOnlyImage";
import BoardResizableImage from "@/features/boards/extensions/boardResizableImage";
import BoardTabKeyboard from "@/features/boards/extensions/boardTabKeyboard";
import {
  BOARD_POST_HR_CLASS,
  boardHorizontalRuleInlineStyle,
} from "@/features/boards/shared/layout/boardPostHorizontalRuleStyles";
import { getPostScopedExtensions } from "@/features/boards/shared/hooks/boardExtensions/postScopedExtensions";
import {
  getDetailsExtensions,
  getTableExtensions,
} from "@/features/boards/shared/hooks/boardExtensions/scopedNodeExtensions";
import type { UseExtensionsOptions } from "@/features/boards/shared/hooks/useBoardExtensions";

const CustomLinkExtension = Link.extend({
  inclusive: false,
});

const CustomSubscript = Subscript.extend({
  excludes: "superscript",
});

const CustomSuperscript = Superscript.extend({
  excludes: "subscript",
});

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

export function buildBoardExtensions({
  placeholder,
  scope = "post",
  mode = "edit",
  onTableOfContentsUpdate,
}: UseExtensionsOptions = {}): EditorOptions["extensions"] {
  const tocHeadingIds = new Set<string>();
  const isPost = scope === "post";
  const isView = mode === "view";

  const tableExtensions = getTableExtensions(isPost);
  const detailsExtensions = getDetailsExtensions(isPost);
  const postScopedExtensions = getPostScopedExtensions({
    isPost,
    isView,
    tocHeadingIds,
    onTableOfContentsUpdate,
  });

  return [
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
    Bold,
    Blockquote,
    Code,
    Italic,
    Underline,
    Strike,
    CustomLinkExtension.configure({
      autolink: true,
      linkOnPaste: true,
      openOnClick: false,
    }),
    LinkBubbleMenuHandler,
    ...detailsExtensions,
    ...postScopedExtensions,
    Gapcursor,
    TextAlign.configure({
      types: ["heading", "paragraph", "image"],
      defaultAlignment: null,
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
    isView ? BoardReadOnlyImage : BoardResizableImage,
    ...(isView ? [] : [Dropcursor]),
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    ...(placeholder
      ? [
          Placeholder.configure({
            placeholder,
          }),
        ]
      : []),
    History,
    BoardTabKeyboard,
    ...(isView ? [] : [BoardImagePaste]),
  ];
}
