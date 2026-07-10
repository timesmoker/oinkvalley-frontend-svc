import axios from "axios";
import type {
    CalendarEntry,
    CalendarEntryCreateDefaults,
    CalendarEntryDraftPreview,
} from "@/features/calendar/types/calendar";
import { dateKey, formatDayTitle } from "@/features/calendar/lib/entryUtils";

export type DaySelection = {
    key: string;
    label: string;
};

export function daySelectionFromDate(date: Date): DaySelection {
    return {
        key: dateKey(date.getFullYear(), date.getMonth(), date.getDate()),
        label: formatDayTitle(date),
    };
}

export function defaultsFromDraft(
    prev: CalendarEntryCreateDefaults | null,
    draft: CalendarEntryDraftPreview,
): CalendarEntryCreateDefaults {
    return {
        ...(prev ?? {}),
        allDay: draft.allDay ?? prev?.allDay,
        startDate: draft.startDate ?? prev?.startDate,
        endDate: draft.endDate ?? prev?.endDate,
        startTime: draft.startTime ?? prev?.startTime,
        endTime: draft.endTime ?? prev?.endTime,
        title: draft.title,
        tags: draft.tags,
    };
}

export function draftFromEntry(entry: CalendarEntry): CalendarEntryDraftPreview {
    return {
        title: entry.title,
        tags: entry.tags,
        allDay: entry.allDay,
        startDate: entry.startDate,
        endDate: entry.endDate,
        startTime: entry.startTime,
        endTime: entry.endTime,
    };
}

/** 시간 일정(allDay=false)은 하루짜리로 유지하며 스케줄 패치를 병합 */
export function mergeSchedulePatchIntoDraft(
    current: CalendarEntryDraftPreview,
    patch: Partial<CalendarEntryDraftPreview>,
): CalendarEntryDraftPreview {
    const next = { ...current, ...patch };
    if (current.allDay === false && patch.allDay !== false) {
        const startDate = next.startDate ?? current.startDate;
        return {
            ...next,
            allDay: false,
            startDate,
            endDate: startDate ?? next.endDate,
        };
    }
    if (next.allDay === false && next.startDate) {
        return { ...next, endDate: next.startDate };
    }
    return next;
}

export function calendarErrorMessage(error: unknown, fallback: string) {
    if (axios.isAxiosError(error)) {
        const message = (error.response?.data as { message?: unknown } | undefined)
            ?.message;
        if (typeof message === "string" && message.trim()) {
            return message;
        }
    }
    return fallback;
}
