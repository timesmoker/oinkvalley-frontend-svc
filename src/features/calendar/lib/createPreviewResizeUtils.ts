import { parseDateKey, timeToMinutes } from "@/features/calendar/lib/entryUtils";

export const CREATE_PREVIEW_TIME_STEP = 30;
/** 일간 플래너 격자(5분)와 동일 */
export const PLANNER_PREVIEW_TIME_STEP = 5;

export function snapTimelineMinutes(
    totalMinutes: number,
    step = CREATE_PREVIEW_TIME_STEP,
    minMinutes = 0,
    maxMinutes = 23 * 60 + 30,
) {
    const snapped = Math.round(totalMinutes / step) * step;
    return Math.max(minMinutes, Math.min(maxMinutes, snapped));
}

export function minutesToTimeLabel(totalMinutes: number) {
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function utcDayMs(key: string) {
    const { year, month, day } = parseDateKey(key);
    return Date.UTC(year, month, day);
}

export function diffCalendarDays(fromKey: string, toKey: string) {
    return Math.round((utcDayMs(toKey) - utcDayMs(fromKey)) / 86_400_000);
}

export function addCalendarDays(key: string, deltaDays: number) {
    const next = new Date(utcDayMs(key) + deltaDays * 86_400_000);
    return [
        next.getUTCFullYear(),
        String(next.getUTCMonth() + 1).padStart(2, "0"),
        String(next.getUTCDate()).padStart(2, "0"),
    ].join("-");
}

export function minutesFromTimelineRect(
    clientY: number,
    rect: DOMRect,
    hourStart: number,
    hourCount: number,
    step = CREATE_PREVIEW_TIME_STEP,
) {
    const ratio = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const raw = hourStart * 60 + ratio * hourCount * 60;
    const maxMinutes = hourStart * 60 + hourCount * 60;
    return snapTimelineMinutes(raw, step, hourStart * 60, maxMinutes);
}

export function clampTimedRange(
    startTime: string,
    endTime: string,
    edge: "start" | "end",
    nextMinutes: number,
    step = CREATE_PREVIEW_TIME_STEP,
) {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    if (edge === "start") {
        const nextStart = Math.min(nextMinutes, end - step);
        return {
            startTime: minutesToTimeLabel(nextStart),
            endTime,
        };
    }
    const nextEnd = Math.max(nextMinutes, start + step);
    return {
        startTime,
        endTime: minutesToTimeLabel(nextEnd),
    };
}
