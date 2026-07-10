"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    clampTimedRange,
    minutesFromTimelineRect,
    PLANNER_PREVIEW_TIME_STEP,
    snapTimelineMinutes,
} from "@/features/calendar/lib/createPreviewResizeUtils";

type TimedSchedule = {
    startTime: string;
    endTime: string;
};

type PlannerPreviewResizeOptions = {
    schedule: TimedSchedule | null;
    plannerStartHour: number;
    rowHeight: number;
    scrollRef: React.RefObject<HTMLElement | null>;
    onResize: (patch: { startTime?: string; endTime?: string }) => void;
};

function minutesFromPlannerPoint(
    clientX: number,
    clientY: number,
    container: HTMLElement,
    plannerStartHour: number,
    rowHeight: number,
) {
    const containerRect = container.getBoundingClientRect();
    const relativeY = clientY - containerRect.top + container.scrollTop;
    const rowIndex = Math.max(
        0,
        Math.floor(relativeY / rowHeight),
    );
    const hour = plannerStartHour + rowIndex;
    const rows = container.querySelectorAll("[data-planner-row]");
    const row = rows[rowIndex];
    const cell = row?.querySelector("[data-planner-row-cell]");
    if (!(cell instanceof HTMLElement)) {
        return snapTimelineMinutes(hour * 60, PLANNER_PREVIEW_TIME_STEP);
    }
    const rect = cell.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return snapTimelineMinutes(
        hour * 60 + ratio * 60,
        PLANNER_PREVIEW_TIME_STEP,
    );
}

export function usePlannerPreviewResize({
    schedule,
    plannerStartHour,
    rowHeight,
    scrollRef,
    onResize,
}: PlannerPreviewResizeOptions) {
    const [resizingEdge, setResizingEdge] = useState<"start" | "end" | null>(null);

    const begin = useCallback((edge: "start" | "end", event: React.PointerEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setResizingEdge(edge);
        event.currentTarget.setPointerCapture(event.pointerId);
    }, []);

    useEffect(() => {
        if (!resizingEdge || !schedule) return;

        const applyAtPoint = (clientX: number, clientY: number) => {
            const container = scrollRef.current;
            if (!container) return;
            const minutes = minutesFromPlannerPoint(
                clientX,
                clientY,
                container,
                plannerStartHour,
                rowHeight,
            );
            onResize(
                clampTimedRange(
                    schedule.startTime,
                    schedule.endTime,
                    resizingEdge,
                    minutes,
                    PLANNER_PREVIEW_TIME_STEP,
                ),
            );
        };

        const onMove = (event: PointerEvent) => applyAtPoint(event.clientX, event.clientY);

        const finish = () => setResizingEdge(null);

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", finish, true);
        window.addEventListener("pointercancel", finish, true);
        return () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", finish, true);
            window.removeEventListener("pointercancel", finish, true);
        };
    }, [onResize, plannerStartHour, resizingEdge, rowHeight, schedule, scrollRef]);

    return {
        begin,
        isResizing: resizingEdge != null,
    };
}
