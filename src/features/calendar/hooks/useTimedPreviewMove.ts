"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { calendarDayKeyFromPoint, timeToMinutes } from "@/features/calendar/lib/entryUtils";
import {
    addCalendarDays,
    CREATE_PREVIEW_TIME_STEP,
    diffCalendarDays,
    minutesFromTimelineRect,
    minutesToTimeLabel,
} from "@/features/calendar/lib/createPreviewResizeUtils";

type TimedSchedule = {
    startDate?: string;
    endDate?: string;
    startTime: string;
    endTime: string;
};

type ResolveDayKey = (clientX: number, clientY: number) => string | null;

type TimedPreviewMoveOptions = {
    schedule: TimedSchedule | null;
    hourStart: number;
    hourCount: number;
    step?: number;
    resolveDayKey?: ResolveDayKey;
    onMove: (patch: {
        startDate?: string;
        endDate?: string;
        startTime: string;
        endTime: string;
    }) => void;
};

type MoveOrigin = {
    pointerMinutes: number;
    pointerDayKey?: string;
    startDate?: string;
    endDate?: string;
    startMinutes: number;
    endMinutes: number;
};

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

export function useTimedPreviewMove({
    schedule,
    hourStart,
    hourCount,
    step,
    resolveDayKey,
    onMove,
}: TimedPreviewMoveOptions) {
    const [isMoving, setIsMoving] = useState(false);
    const containerRef = useRef<HTMLElement | null>(null);
    const originRef = useRef<MoveOrigin | null>(null);
    const snapStep = step ?? CREATE_PREVIEW_TIME_STEP;

    const dayKeyAt = useCallback(
        (clientX: number, clientY: number) =>
            resolveDayKey?.(clientX, clientY) ??
            calendarDayKeyFromPoint(clientX, clientY),
        [resolveDayKey],
    );

    const begin = useCallback(
        (event: ReactPointerEvent<HTMLElement>, anchorDayKey?: string) => {
            if (!schedule) return;
            event.preventDefault();
            event.stopPropagation();

            const column = event.currentTarget.closest("[data-timeline-column]");
            const container =
                column instanceof HTMLElement ? column : event.currentTarget.parentElement;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const pointerMinutes = minutesFromTimelineRect(
                event.clientY,
                rect,
                hourStart,
                hourCount,
                snapStep,
            );
            const startMinutes = timeToMinutes(schedule.startTime);
            const endMinutes = timeToMinutes(schedule.endTime);
            if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes)) return;

            containerRef.current = container;
            originRef.current = {
                pointerMinutes,
                pointerDayKey:
                    anchorDayKey ?? dayKeyAt(event.clientX, event.clientY) ?? undefined,
                startDate: schedule.startDate,
                endDate: schedule.endDate,
                startMinutes,
                endMinutes,
            };
            setIsMoving(true);
            event.currentTarget.setPointerCapture(event.pointerId);
        },
        [dayKeyAt, hourCount, hourStart, schedule, snapStep],
    );

    useEffect(() => {
        if (!isMoving) return;

        const applyAtPoint = (clientX: number, clientY: number) => {
            const container = containerRef.current;
            const origin = originRef.current;
            if (!container || !origin) return;

            const rect = container.getBoundingClientRect();
            const pointerMinutes = minutesFromTimelineRect(
                clientY,
                rect,
                hourStart,
                hourCount,
                snapStep,
            );
            const minMinutes = hourStart * 60;
            const maxMinutes = (hourStart + hourCount) * 60;
            const rawDelta = pointerMinutes - origin.pointerMinutes;
            const delta = clampDelta(
                rawDelta,
                origin.startMinutes,
                origin.endMinutes,
                minMinutes,
                maxMinutes,
            );
            const patch: {
                startDate?: string;
                endDate?: string;
                startTime: string;
                endTime: string;
            } = {
                startTime: minutesToTimeLabel(origin.startMinutes + delta),
                endTime: minutesToTimeLabel(origin.endMinutes + delta),
            };

            const nextPointerDayKey = dayKeyAt(clientX, clientY);
            if (
                origin.pointerDayKey &&
                nextPointerDayKey &&
                origin.startDate &&
                origin.endDate
            ) {
                const dayDelta = diffCalendarDays(
                    origin.pointerDayKey,
                    nextPointerDayKey,
                );
                patch.startDate = addCalendarDays(origin.startDate, dayDelta);
                patch.endDate = addCalendarDays(origin.endDate, dayDelta);
            }

            onMove(patch);
        };

        const onMovePointer = (event: PointerEvent) => {
            applyAtPoint(event.clientX, event.clientY);
        };

        const finish = () => {
            containerRef.current = null;
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
    }, [dayKeyAt, hourCount, hourStart, isMoving, onMove, snapStep]);

    return { begin, isMoving };
}
