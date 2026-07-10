/** 주·일 타임라인 공통 (Google Calendar 스타일 시간축) */
export const CALENDAR_HOUR_HEIGHT = 48;

export const CALENDAR_TIMELINE_START_HOUR = 7;
export const CALENDAR_TIMELINE_END_HOUR = 23;

/** `grid-cols-[3rem_…]` 와 동일 */
export const CALENDAR_TIMELINE_LABEL_CLASS = "w-12 shrink-0";

export function formatHourLabel(hour: number): string {
    return `${hour}:00`;
}
