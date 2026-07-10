"use client";

import { useCallback, useEffect, useState } from "react";
import { calendarDayKeyFromPoint } from "@/features/calendar/lib/entryUtils";

type AllDaySchedule = {
    startDate: string;
    endDate: string;
};

type ResolveDayKey = (clientX: number, clientY: number) => string | null;

export function useAllDayPreviewResize(
    schedule: AllDaySchedule | null,
    onResize: (patch: { startDate?: string; endDate?: string }) => void,
    resolveDayKey?: ResolveDayKey,
) {
    const [resizingEdge, setResizingEdge] = useState<"start" | "end" | null>(null);

    const begin = useCallback((edge: "start" | "end", event: React.PointerEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setResizingEdge(edge);
        event.currentTarget.setPointerCapture(event.pointerId);
    }, []);

    useEffect(() => {
        if (!resizingEdge || !schedule) return;

        const dayKeyAt = (clientX: number, clientY: number) =>
            resolveDayKey?.(clientX, clientY) ??
            calendarDayKeyFromPoint(clientX, clientY);

        const applyAtPoint = (clientX: number, clientY: number) => {
            const key = dayKeyAt(clientX, clientY);
            if (!key) return;
            if (resizingEdge === "start" && key <= schedule.endDate) {
                onResize({ startDate: key });
            } else if (resizingEdge === "end" && key >= schedule.startDate) {
                onResize({ endDate: key });
            }
        };

        const onMove = (event: PointerEvent) => {
            applyAtPoint(event.clientX, event.clientY);
        };

        const finish = () => setResizingEdge(null);

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", finish, true);
        window.addEventListener("pointercancel", finish, true);
        return () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", finish, true);
            window.removeEventListener("pointercancel", finish, true);
        };
    }, [onResize, resolveDayKey, resizingEdge, schedule]);

    return {
        begin,
        isResizing: resizingEdge != null,
        resizingEdge,
    };
}
