import { getText, getTextSerializersFromSchema } from "@tiptap/core";
import type { NodeViewProps } from "@tiptap/react";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { useMemo } from "react";
import {
    boardBlockIndentMarginLeft,
    getBoardBlockIndentLevel,
} from "@/features/boards/extensions/blockIndent";
import {
    BOARD_POST_HEADING_CLASS,
    getBoardHeadingSpacing,
} from "@/features/boards/shared/layout/boardPostHeadingStyles";
import { slugifyHeadingText } from "@/features/boards/lib/headingId";

/** 게시글 heading — `id`는 우측 목차 scrollIntoView용. 본문 앵커 링크 UI는 없음. */
export default function HeadingWithAnchorTocComponent({
    editor,
    node,
    extension,
}: NodeViewProps) {
    const hasLevel = extension.options.levels.includes(node.attrs.level);
    const level = hasLevel ? node.attrs.level : extension.options.levels[0];
    const HeadingTag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

    const textSerializers = useMemo(
        () => getTextSerializersFromSchema(editor.schema),
        [editor.schema],
    );

    const storedId =
        typeof node.attrs.id === "string" && node.attrs.id.trim().length > 0
            ? node.attrs.id.trim()
            : typeof node.attrs["data-toc-id"] === "string" &&
                String(node.attrs["data-toc-id"]).trim().length > 0
              ? String(node.attrs["data-toc-id"]).trim()
              : "";

    const headingId =
        storedId ||
        slugifyHeadingText(
            getText(node, {
                textSerializers,
            }),
        ) ||
        "section";

    const spacing = getBoardHeadingSpacing(level);
    const indentLevel = getBoardBlockIndentLevel(node.attrs);

    return (
        <NodeViewWrapper
            as={HeadingTag}
            id={headingId}
            {...extension.options.HTMLAttributes}
            className={BOARD_POST_HEADING_CLASS}
            data-indent={indentLevel > 0 ? indentLevel : undefined}
            style={{
                textAlign: node.attrs.textAlign,
                display: "block",
                fontWeight: 700,
                fontSize: spacing.fontSize,
                lineHeight: spacing.lineHeight,
                marginBlockStart: 0,
                marginBlockEnd: spacing.marginBlockEnd,
                marginLeft: boardBlockIndentMarginLeft(indentLevel),
            }}
        >
            <NodeViewContent as="span" />
        </NodeViewWrapper>
    );
}
