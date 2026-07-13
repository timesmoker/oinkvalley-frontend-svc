"use client";

import { useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const CREATE_PREVIEW_BLOCK_CLASS =
    "pointer-events-auto relative z-[20] select-none";

type EdgeOrientation = "horizontal" | "vertical";

type CreatePreviewEdgeShadesProps = {
    orientation?: EdgeOrientation;
    showStart?: boolean;
    showEnd?: boolean;
};

/** 고스트 양끝 음영 — 늘릴 수 있어 보이게 */
export function CreatePreviewEdgeShades({
    orientation = "horizontal",
    showStart = true,
    showEnd = true,
}: CreatePreviewEdgeShadesProps) {
    const isHorizontal = orientation === "horizontal";
    const startClass = isHorizontal
        ? "inset-y-0 left-0 w-4 bg-gradient-to-r from-black/20 to-transparent dark:from-black/40"
        : "inset-x-0 top-0 h-4 bg-gradient-to-b from-black/20 to-transparent dark:from-black/40";
    const endClass = isHorizontal
        ? "inset-y-0 right-0 w-4 bg-gradient-to-l from-black/20 to-transparent dark:from-black/40"
        : "inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/20 to-transparent dark:from-black/40";

    return (
        <>
            {showStart && (
                <div
                    aria-hidden
                    className={cn("pointer-events-none absolute z-[1]", startClass)}
                />
            )}
            {showEnd && (
                <div
                    aria-hidden
                    className={cn("pointer-events-none absolute z-[1]", endClass)}
                />
            )}
        </>
    );
}

type CreatePreviewResizableProps = {
    orientation: EdgeOrientation;
    showStartHandle: boolean;
    showEndHandle: boolean;
    onResizeStart: (edge: "start" | "end", event: React.PointerEvent<HTMLDivElement>) => void;
    onMoveStart?: (event: React.PointerEvent<HTMLDivElement>) => void;
    onActivate?: () => void;
    isMoving?: boolean;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
};

export default function CreatePreviewResizable({
    orientation,
    showStartHandle,
    showEndHandle,
    onResizeStart,
    onMoveStart,
    onActivate,
    isMoving = false,
    className,
    style,
    children,
}: CreatePreviewResizableProps) {
    const isHorizontal = orientation === "horizontal";
    const activePointerRef = useRef<number | null>(null);

    return (
        <div
            onPointerDown={(event) => {
                activePointerRef.current = event.pointerId;
                onMoveStart?.(event);
            }}
            onPointerUp={(event) => {
                if (activePointerRef.current !== event.pointerId) return;
                activePointerRef.current = null;
                onActivate?.();
            }}
            onPointerCancel={(event) => {
                if (activePointerRef.current === event.pointerId) {
                    activePointerRef.current = null;
                }
            }}
            className={cn(
                CREATE_PREVIEW_BLOCK_CLASS,
                onMoveStart && "cursor-grab active:cursor-grabbing",
                isMoving && "opacity-90",
                className,
            )}
            style={style}
        >
            <CreatePreviewEdgeShades
                orientation={orientation}
                showStart={showStartHandle}
                showEnd={showEndHandle}
            />
            {showStartHandle && (
                <div
                    role="separator"
                    aria-orientation={isHorizontal ? "vertical" : "horizontal"}
                    aria-label={isHorizontal ? "시작일 조정" : "시작 시간 조정"}
                    onPointerDown={(event) => onResizeStart("start", event)}
                    className={cn(
                        "absolute z-10 touch-none",
                        isHorizontal
                            ? "inset-y-0 left-1 w-2 cursor-ew-resize"
                            : "inset-x-0 top-1 h-2 cursor-ns-resize",
                    )}
                />
            )}
            {showEndHandle && (
                <div
                    role="separator"
                    aria-orientation={isHorizontal ? "vertical" : "horizontal"}
                    aria-label={isHorizontal ? "종료일 조정" : "종료 시간 조정"}
                    onPointerDown={(event) => onResizeStart("end", event)}
                    className={cn(
                        "absolute z-10 touch-none",
                        isHorizontal
                            ? "inset-y-0 right-1 w-2 cursor-ew-resize"
                            : "inset-x-0 bottom-1 h-2 cursor-ns-resize",
                    )}
                />
            )}
            <div
                className={cn(
                    "pointer-events-none relative z-[2] h-full min-h-0 overflow-hidden",
                    isHorizontal ? "px-1 py-0.5" : "px-1 py-0.5",
                )}
            >
                {children}
            </div>
        </div>
    );
}
