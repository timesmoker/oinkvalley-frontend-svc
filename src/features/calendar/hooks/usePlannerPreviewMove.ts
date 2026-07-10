"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { timeToMinutes } from "@/features/calendar/lib/entryUtils";
import {
    minutesToTimeLabel,
    PLANNER_PREVIEW_TIME_STEP,
    snapTimelineMinutes,
} from "@/features/calendar/lib/createPreviewResizeUtils";

type TimedSchedule = {
    startTime: string;
    endTime: string;
};

type PlannerPreviewMoveOptions = {
    schedule: TimedSchedule | null;
    plannerStartHour: number;
    rowHeight: number;
    scrollRef: React.RefObject<HTMLElement | null>;
    onMove: (patch: { startTime: string; endTime: string }) => void;
};

type MoveOrigin = {
    pointerMinutes: number;
    startMinutes: number;
    endMinutes: number;
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
    const rowIndex = Math.max(0, Math.floor(relativeY / rowHeight));
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

function clampDelta(
    delta: number,
    startMinutes: number,
    endMinutes: number,
    minMinutes: number,
    maxMinutes: number,
) {
    if (startMinutes + delta < minMinutes) return minMinutes - startMinutes;
    if (endMinutes + delta > maxMinutes) return maxMinutes - endMinutes;
    return delta;
}

export function usePlannerPreviewMove({
    schedule,
    plannerStartHour,
    rowHeight,
    scrollRef,
    onMove,
}: PlannerPreviewMoveOptions) {
    const [isMoving, setIsMoving] = useState(false);
    const originRef = useRef<MoveOrigin | null>(null);

    const begin = useCallback(
        (event: ReactPointerEvent<HTMLElement>) => {
            if (!schedule) return;
            const container = scrollRef.current;
            if (!container) return;
            event.preventDefault();
            event.stopPropagation();

            const pointerMinutes = minutesFromPlannerPoint(
                event.clientX,
                event.clientY,
                container,
                plannerStartHour,
                rowHeight,
            );
            const startMinutes = timeToMinutes(schedule.startTime);
            const endMinutes = timeToMinutes(schedule.endTime);
            if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes)) return;

            originRef.current = {
                pointerMinutes,
                startMinutes,
                endMinutes,
            };
            setIsMoving(true);
            event.currentTarget.setPointerCapture(event.pointerId);
        },
        [plannerStartHour, rowHeight, schedule, scrollRef],
    );

    useEffect(() => {
        if (!isMoving) return;

        const applyAtPoint = (clientX: number, clientY: number) => {
            const container = scrollRef.current;
            const origin = originRef.current;
            if (!container || !origin) return;
            const pointerMinutes = minutesFromPlannerPoint(
                clientX,
                clientY,
                container,
                plannerStartHour,
                rowHeight,
            );
            const minMinutes = plannerStartHour * 60;
            const maxMinutes = minMinutes + container.querySelectorAll("[data-planner-row]").length * 60;
            const delta = clampDelta(
                pointerMinutes - origin.pointerMinutes,
                origin.startMinutes,
                origin.endMinutes,
                minMinutes,
                maxMinutes,
            );
            onMove({
                startTime: minutesToTimeLabel(origin.startMinutes + delta),
                endTime: minutesToTimeLabel(origin.endMinutes + delta),
            });
        };

        const onMovePointer = (event: PointerEvent) => {
            applyAtPoint(event.clientX, event.clientY);
        };

        const finish = () => {
            originRef.current = null;
            setIsMoving(false);
        };

        window.addEventListener("pointermove", onMovePointer);
        window.addEventListener("pointerup", finish, true);
        window.addEventListener("pointercancel", finish, true);
        return () => {
            window.removeEventListener("pointermove", onMovePointer);
            window.removeEventListener("pointerup", finish, true);
            window.removeEventListener("pointercancel", finish, true);
        };
    }, [isMoving, onMove, plannerStartHour, rowHeight, scrollRef]);

    return { begin, isMoving };
}
