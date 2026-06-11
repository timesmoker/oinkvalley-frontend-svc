"use client";

import { Box } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { ResizableImage } from "mui-tiptap";

const MIN_WIDTH_PX = 40;

/**
 * mui-tiptap ResizableImage 의 NodeView 교체본.
 * 원본은 이미지 왼쪽 끝 기준(clientX - rect.x)으로 폭을 계산해서,
 * 가운데 정렬된 이미지는 양쪽으로 자라며 핸들이 커서의 절반 속도로만
 * 따라와 불안정했다. 여기서는 중심 기준(중심→커서 거리 ×2)으로 계산.
 */
function BoardResizableImageComponent({
    node,
    selected,
    editor,
    updateAttributes,
}: NodeViewProps) {
    const { attrs } = node;
    const imageRef = useRef<HTMLImageElement>(null);
    const [resizing, setResizing] = useState(false);
    const frameRef = useRef(0);

    useEffect(() => {
        if (!resizing) return;

        const handleMouseMove = (event: MouseEvent) => {
            cancelAnimationFrame(frameRef.current);
            frameRef.current = requestAnimationFrame(() => {
                const img = imageRef.current;
                if (!img) return;
                const rect = img.getBoundingClientRect();

                /* 가로: 중심 고정이므로 중심→커서 거리의 2배가 새 폭 */
                const widthFromCursor =
                    2 * (event.clientX - (rect.x + rect.width / 2));
                /* 세로: 위쪽 고정 — 비율 유지해 폭으로 환산 */
                const widthFromHeight =
                    (rect.width / rect.height) * (event.clientY - rect.y);

                const wrapper = img.closest("[data-node-view-wrapper]");
                const maxWidth = wrapper?.clientWidth ?? Infinity;

                const next = Math.min(
                    Math.max(widthFromCursor, widthFromHeight, MIN_WIDTH_PX),
                    maxWidth,
                );
                updateAttributes({ width: Math.round(next) });
            });
        };
        const handleMouseUp = () => setResizing(false);

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            cancelAnimationFrame(frameRef.current);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [resizing, updateAttributes]);

    const active = selected || resizing;

    return (
        <NodeViewWrapper
            style={{
                width: "100%",
                textAlign:
                    (attrs.textAlign as "left" | "center" | "right") ||
                    "center",
            }}
        >
            <Box
                component="span"
                sx={{ display: "inline-flex", position: "relative" }}
            >
                {/* NodeView 내부 img — alt 등은 tiptap attrs 로 관리 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    ref={imageRef}
                    src={attrs.src as string}
                    alt={(attrs.alt as string) || ""}
                    title={(attrs.title as string) || undefined}
                    width={(attrs.width as number) || undefined}
                    height="auto"
                    data-drag-handle
                    className={active ? "ProseMirror-selectednode" : undefined}
                    style={{
                        display: "block",
                        maxWidth: "100%",
                        aspectRatio: (attrs.aspectRatio as string) ?? undefined,
                    }}
                    onLoad={(event) => {
                        /* 원본과 동일 — 자연 크기로 width/비율 채워 재로드 깜빡임 방지 */
                        const next: Record<string, unknown> = {};
                        if (!attrs.width) {
                            next.width = event.currentTarget.naturalWidth;
                        }
                        if (!attrs.aspectRatio) {
                            next.aspectRatio = String(
                                event.currentTarget.naturalWidth /
                                    event.currentTarget.naturalHeight,
                            );
                        }
                        if (Object.keys(next).length > 0) {
                            updateAttributes(next);
                        }
                    }}
                />
                {active && editor.isEditable && (
                    <Box
                        component="span"
                        onMouseDown={(event) => {
                            /* 드래그 중 텍스트 선택·노드 deselect 방지 */
                            event.preventDefault();
                            setResizing(true);
                        }}
                        sx={{
                            position: "absolute",
                            bottom: -3,
                            right: -3,
                            width: 12,
                            height: 12,
                            backgroundColor: "primary.main",
                            cursor: "nwse-resize",
                        }}
                    />
                )}
            </Box>
        </NodeViewWrapper>
    );
}

/** 에디터용 — ResizableImage 스키마 + 이미지 기본 정렬 center, NodeView 교체 */
const BoardResizableImage = ResizableImage.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            /* TextAlign 글로벌(default left)을 덮어 이미지만 기본 center.
               노드 자체 addAttributes 가 글로벌보다 나중에 등록돼 우선함 */
            textAlign: {
                default: "center",
                renderHTML: (attributes) =>
                    attributes.textAlign
                        ? { style: `text-align: ${attributes.textAlign}` }
                        : {},
                parseHTML: (element) =>
                    element.style.textAlign || "center",
            },
        };
    },
    addNodeView() {
        return ReactNodeViewRenderer(BoardResizableImageComponent);
    },
});

export default BoardResizableImage;
