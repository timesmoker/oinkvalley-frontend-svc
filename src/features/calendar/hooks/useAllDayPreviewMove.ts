"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { calendarDayKeyFromPoint } from "@/features/calendar/lib/entryUtils";
import {
    addCalendarDays,
    diffCalendarDays,
} from "@/features/calendar/lib/createPreviewResizeUtils";

type AllDaySchedule = {
    startDate: string;
    endDate: string;
};

type ResolveDayKey = (clientX: number, clientY: number) => string | null;

type MoveOrigin = {
    pointerDayKey: string;
    startDate: string;
    endDate: string;
};

export function useAllDayPreviewMove(
    schedule: AllDaySchedule | null,
    onMove: (patch: { startDate: string; endDate: string }) => void,
    resolveDayKey?: ResolveDayKey,
) {
    const [isMoving, setIsMoving] = useState(false);
    const originRef = useRef<MoveOrigin | null>(null);

    const dayKeyAt = useCallback(
        (clientX: number, clientY: number) =>
            resolveDayKey?.(clientX, clientY) ??
            calendarDayKeyFromPoint(clientX, clientY),
        [resolveDayKey],
    );

    const begin = useCallback(
        (event: React.PointerEvent<HTMLElement>, anchorDayKey?: string) => {
            if (!schedule) return;
            event.preventDefault();
            event.stopPropagation();
            const pointerDayKey =
                anchorDayKey ?? dayKeyAt(event.clientX, event.clientY);
            if (!pointerDayKey) return;
            originRef.current = {
                pointerDayKey,
                startDate: schedule.startDate,
                endDate: schedule.endDate,
            };
            setIsMoving(true);
            event.currentTarget.setPointerCapture(event.pointerId);
        },
        [dayKeyAt, schedule],
    );

    useEffect(() => {
        if (!isMoving) return;

        const applyAtPoint = (clientX: number, clientY: number) => {
            const origin = originRef.current;
            if (!origin) return;
            const nextPointerDayKey = dayKeyAt(clientX, clientY);
            if (!nextPointerDayKey) return;
            const delta = diffCalendarDays(origin.pointerDayKey, nextPointerDayKey);
            onMove({
                startDate: addCalendarDays(origin.startDate, delta),
                endDate: addCalendarDays(origin.endDate, delta),
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
    }, [dayKeyAt, isMoving, onMove]);

    return { begin, isMoving };
}
