"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    clampTimedRange,
    CREATE_PREVIEW_TIME_STEP,
    minutesFromTimelineRect,
} from "@/features/calendar/lib/createPreviewResizeUtils";

type TimedSchedule = {
    startTime: string;
    endTime: string;
};

type TimedPreviewResizeOptions = {
    schedule: TimedSchedule | null;
    hourStart: number;
    hourCount: number;
    step?: number;
    onResize: (patch: { startTime?: string; endTime?: string }) => void;
};

export function useTimedPreviewResize({
    schedule,
    hourStart,
    hourCount,
    step,
    onResize,
}: TimedPreviewResizeOptions) {
    const [resizingEdge, setResizingEdge] = useState<"start" | "end" | null>(null);
    const containerRef = useRef<HTMLElement | null>(null);

    const begin = useCallback(
        (edge: "start" | "end", event: React.PointerEvent<HTMLElement>) => {
            event.preventDefault();
            event.stopPropagation();
            const column = event.currentTarget.closest("[data-timeline-column]");
            containerRef.current =
                column instanceof HTMLElement ? column : event.currentTarget.parentElement;
            setResizingEdge(edge);
            event.currentTarget.setPointerCapture(event.pointerId);
        },
        [],
    );

    useEffect(() => {
        if (!resizingEdge || !schedule) return;

        const applyAtPoint = (clientY: number) => {
            const container = containerRef.current;
            if (!container) return;
            const rect = container.getBoundingClientRect();
            const minutes = minutesFromTimelineRect(
                clientY,
                rect,
                hourStart,
                hourCount,
                step ?? CREATE_PREVIEW_TIME_STEP,
            );
            const next = clampTimedRange(
                schedule.startTime,
                schedule.endTime,
                resizingEdge,
                minutes,
                step ?? CREATE_PREVIEW_TIME_STEP,
            );
            onResize(next);
        };

        const onMove = (event: PointerEvent) => applyAtPoint(event.clientY);

        const finish = () => {
            setResizingEdge(null);
            containerRef.current = null;
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", finish, true);
        window.addEventListener("pointercancel", finish, true);
        return () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", finish, true);
            window.removeEventListener("pointercancel", finish, true);
        };
    }, [hourCount, hourStart, onResize, resizingEdge, schedule, step]);

    return {
        begin,
        isResizing: resizingEdge != null,
        resizingEdge,
    };
}
