import type { CalendarEntry, CalendarEntryType, CalendarViewMode } from "@/features/calendar/types/calendar";
import { authorLabel } from "@/features/profile/api/profileSvc";
import { getTagStyle } from "@/features/calendar/tags/tagRegistry";
import type { ClassValue } from "clsx";
import { cn } from "@/lib/utils";

/** 말줄임(...) 없이 박스 밖만 잘림 */
export const clipText = "overflow-hidden whitespace-nowrap";

export function normalizeEntryTags(
    tags: CalendarEntryType[],
    knownIds?: ReadonlySet<CalendarEntryType>,
): CalendarEntryType[] {
    const seen = new Set<CalendarEntryType>();
    const out: CalendarEntryType[] = [];
    for (const t of tags) {
        if (!t.trim() || seen.has(t)) continue;
        if (knownIds && !knownIds.has(t)) continue;
        seen.add(t);
        out.push(t);
    }
    return out;
}

export function formatParticipantIdsInput(ids: number[]): string {
    return ids.join(", ");
}

export function parseParticipantEmailsInput(raw: string): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const part of raw.split(/[,，\s]+/)) {
        const email = part.trim().toLowerCase();
        if (!email || seen.has(email)) continue;
        seen.add(email);
        out.push(email);
    }
    return out;
}

export function hasInvalidParticipantEmail(emails: string[]): boolean {
    return emails.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}

/** 소유자와 중복·0 이하 제거 */
export function normalizeParticipantIds(ids: number[], ownerId: number): number[] {
    const seen = new Set<number>();
    const out: number[] = [];
    for (const id of ids) {
        if (id <= 0 || id === ownerId || seen.has(id)) continue;
        seen.add(id);
        out.push(id);
    }
    return out;
}

export function collectEntryUserIds(entries: CalendarEntry[]): number[] {
    const set = new Set<number>();
    for (const e of entries) {
        if (e.ownerId > 0) set.add(e.ownerId);
        for (const id of e.participantIds) {
            if (id > 0) set.add(id);
        }
    }
    return [...set];
}

export function formatEntryOwnerLabel(
    ownerId: number,
    nicknameByUserId?: Record<string, string>,
): string {
    return authorLabel(nicknameByUserId, ownerId);
}

export function formatEntryParticipantsLabel(
    participantIds: number[],
    nicknameByUserId?: Record<string, string>,
    participantEmails: string[] = [],
): string {
    const labels = [
        ...participantIds.map((id) => authorLabel(nicknameByUserId, id)),
        ...participantEmails,
    ];
    if (labels.length === 0) return "—";
    return labels.join(", ");
}

/** 필터 OR: 일정 tags 중 활성 태그와 하나라도 겹치면 표시 */
export function entryMatchesTagFilter(
    entry: CalendarEntry,
    active: ReadonlySet<CalendarEntryType>,
) {
    if (active.size === 0) return false;
    return entry.tags.some((t) => active.has(t));
}

export function filterEntriesByTags(
    entries: CalendarEntry[],
    active: ReadonlySet<CalendarEntryType>,
) {
    if (active.size === 0) return entries;
    return entries.filter((e) => entryMatchesTagFilter(e, active));
}

/** 캘린더 블록 배경·테두리용 대표 태그 (첫 번째) */
export function primaryTag(tags: CalendarEntryType[]): CalendarEntryType {
    return tags[0] ?? "other";
}

export function entryBlockStyle(
    tags: CalendarEntryType[],
    orderedTagIds: readonly CalendarEntryType[],
) {
    return getTagStyle(primaryTag(tags), orderedTagIds);
}

/** 일정 막대·칩 공통 배경·글자색 */
export function entryBlockClasses(
    tags: CalendarEntryType[],
    orderedTagIds: readonly CalendarEntryType[],
    ...extra: ClassValue[]
) {
    const style = entryBlockStyle(tags, orderedTagIds);
    return cn(style.bg, style.text, ...extra);
}

/** 현재 뷰(월/주/일)에 맞는 API 조회 구간 */
export function calendarRangeForView(
    viewMode: CalendarViewMode,
    viewDate: Date,
): { from: string; to: string } {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();

    if (viewMode === "month") {
        const first = new Date(y, m, 1);
        const start = new Date(y, m, 1 - first.getDay());
        const end = addDays(start, 41);
        return {
            from: dateKey(start.getFullYear(), start.getMonth(), start.getDate()),
            to: dateKey(end.getFullYear(), end.getMonth(), end.getDate()),
        };
    }

    if (viewMode === "week") {
        const start = startOfRollingWeek(viewDate);
        const end = addDays(start, 6);
        return {
            from: dateKey(start.getFullYear(), start.getMonth(), start.getDate()),
            to: dateKey(end.getFullYear(), end.getMonth(), end.getDate()),
        };
    }

    const key = dateKey(y, m, viewDate.getDate());
    return { from: key, to: key };
}

/** API types 쿼리: 전체 선택이면 생략(undefined) */
export function typesForApiQuery(
    filter: ReadonlySet<CalendarEntryType>,
    allIds: CalendarEntryType[],
): CalendarEntryType[] | undefined {
    if (filter.size === 0 || filter.size === allIds.length) return undefined;
    return allIds.filter((t) => filter.has(t));
}

export function dateKey(year: number, month: number, day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseDateKey(key: string) {
    const [y, m, d] = key.split("-").map(Number);
    return { year: y, month: m - 1, day: d };
}

export function entryOverlapsDay(entry: CalendarEntry, dayKey: string) {
    return entry.startDate <= dayKey && entry.endDate >= dayKey;
}

export function entryOverlapsRange(entry: CalendarEntry, from: string, to: string) {
    return entry.startDate <= to && entry.endDate >= from;
}

export function entriesForDay(entries: CalendarEntry[], dayKey: string) {
    return entries.filter((e) => entryOverlapsDay(e, dayKey));
}

export function sortEntriesForDay(list: CalendarEntry[]): CalendarEntry[] {
    return [...list].sort((a, b) => {
        if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
        if (a.startTime && b.startTime) return compareTime(a.startTime, b.startTime);
        if (a.startTime) return -1;
        if (b.startTime) return 1;
        return a.title.localeCompare(b.title, "ko");
    });
}

export function isMultiDayEntry(entry: CalendarEntry) {
    return entry.endDate > entry.startDate;
}

export function formatDateLabel(key: string) {
    const { month, day } = parseDateKey(key);
    return `${month + 1}/${day}`;
}

export function formatDateKeyLong(key: string) {
    const { year, month, day } = parseDateKey(key);
    return `${year}년 ${month + 1}월 ${day}일`;
}

/** 상세 패널용 날짜(기간) */
export function formatEntryDateRange(entry: CalendarEntry): string {
    if (entry.startDate === entry.endDate) {
        return formatDateKeyLong(entry.startDate);
    }
    return `${formatDateKeyLong(entry.startDate)} – ${formatDateKeyLong(entry.endDate)}`;
}

/** 모달·리스트용 기간/시간 요약 */
export function formatEntrySchedule(entry: CalendarEntry): string {
    const datePart =
        entry.startDate === entry.endDate
            ? null
            : `${formatDateLabel(entry.startDate)} – ${formatDateLabel(entry.endDate)}`;

    if (entry.allDay) {
        return datePart ? `${datePart} · 종일` : "종일";
    }

    const timePart =
        entry.startTime && entry.endTime
            ? `${entry.startTime} – ${entry.endTime}`
            : entry.startTime ?? "";

    if (datePart && timePart) return `${datePart} · ${timePart}`;
    return datePart ?? timePart ?? "";
}

export function compareTime(a: string, b: string) {
    return timeToMinutes(a) - timeToMinutes(b);
}

/** input[type=time] → HH:mm */
export function normalizeTime(time?: string): string | undefined {
    if (!time?.trim()) return undefined;
    const [h, m] = time.trim().split(":");
    const hh = Number(h);
    const mm = Number(m ?? 0);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return undefined;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/** 주/일 타임라인에서 해당 날짜 칸에 그릴 블록 위치 */
export function weekTimedBlockForDay(
    entry: CalendarEntry,
    dayKey: string,
    hourStart: number,
    hourEnd: number,
    hourHeight: number,
): { top: number; height: number } | null {
    if (entry.allDay || !entry.startTime || !entryOverlapsDay(entry, dayKey)) {
        return null;
    }

    const gridStart = hourStart * 60;
    const gridEnd = (hourEnd + 1) * 60;
    const dayEndMin = 24 * 60;

    let blockStart: number;
    let blockEnd: number;

    if (entry.startDate === entry.endDate && dayKey === entry.startDate) {
        blockStart = timeToMinutes(entry.startTime);
        blockEnd = entry.endTime ? timeToMinutes(entry.endTime) : blockStart + 60;
    } else if (dayKey === entry.startDate) {
        blockStart = timeToMinutes(entry.startTime);
        blockEnd = dayEndMin;
    } else if (dayKey === entry.endDate) {
        blockStart = 0;
        blockEnd = entry.endTime ? timeToMinutes(entry.endTime) : dayEndMin;
    } else if (dayKey > entry.startDate && dayKey < entry.endDate) {
        blockStart = 0;
        blockEnd = dayEndMin;
    } else {
        return null;
    }

    const visStart = Math.max(blockStart, gridStart);
    const visEnd = Math.min(blockEnd, gridEnd);
    if (visEnd <= visStart) return null;

    return {
        top: ((visStart - gridStart) / 60) * hourHeight,
        height: Math.max(((visEnd - visStart) / 60) * hourHeight, 20),
    };
}

export type DayPlannerBarSegment = {
    rowIndex: number;
    hour: number;
    startMin: number;
    endMin: number;
};

/** 플래너 일 보기: 7시~20시 (7, 8, …, 20) */
export const DAY_VIEW_PLANNER_START_HOUR = 7;
export const DAY_VIEW_PLANNER_END_HOUR = 20;
export const DAY_VIEW_PLANNER_ROW_COUNT =
    DAY_VIEW_PLANNER_END_HOUR - DAY_VIEW_PLANNER_START_HOUR + 1;

export function plannerHourList(
    startHour: number = DAY_VIEW_PLANNER_START_HOUR,
    rowCount: number = DAY_VIEW_PLANNER_ROW_COUNT,
): number[] {
    return Array.from({ length: rowCount }, (_, i) => startHour + i);
}

function toPlannerOffset(minute: number, plannerStartHour: number): number {
    let offset = minute - plannerStartHour * 60;
    if (offset < 0) offset += 24 * 60;
    return offset;
}

function timedBlockMinutes(
    entry: CalendarEntry,
    dayKey: string,
): { start: number; end: number } | null {
    if (entry.allDay || !entry.startTime || !entryOverlapsDay(entry, dayKey)) {
        return null;
    }

    const dayEndMin = 24 * 60;

    let blockStart: number;
    let blockEnd: number;

    if (entry.startDate === entry.endDate && dayKey === entry.startDate) {
        blockStart = timeToMinutes(entry.startTime);
        blockEnd = entry.endTime ? timeToMinutes(entry.endTime) : blockStart + 60;
    } else if (dayKey === entry.startDate) {
        blockStart = timeToMinutes(entry.startTime);
        blockEnd = dayEndMin;
    } else if (dayKey === entry.endDate) {
        blockStart = 0;
        blockEnd = entry.endTime ? timeToMinutes(entry.endTime) : dayEndMin;
    } else if (dayKey > entry.startDate && dayKey < entry.endDate) {
        blockStart = 0;
        blockEnd = dayEndMin;
    } else {
        return null;
    }

    return { start: blockStart, end: blockEnd };
}

/** 행(1시간) 안 5분 칸에 맞는 가로 막대 조각 */
export function dayPlannerBarSegments(
    entry: CalendarEntry,
    dayKey: string,
    plannerStartHour: number,
    rowCount: number,
): DayPlannerBarSegment[] {
    const block = timedBlockMinutes(entry, dayKey);
    if (!block) return [];

    let visStart = toPlannerOffset(block.start, plannerStartHour);
    let visEnd = toPlannerOffset(block.end, plannerStartHour);
    if (visEnd <= visStart) {
        if (block.end <= block.start) visEnd += 24 * 60;
        else return [];
    }

    const gridEnd = rowCount * 60;
    visStart = Math.max(visStart, 0);
    visEnd = Math.min(visEnd, gridEnd);
    if (visEnd <= visStart) return [];

    const hours = plannerHourList(plannerStartHour, rowCount);
    const segments: DayPlannerBarSegment[] = [];
    let cursor = visStart;

    while (cursor < visEnd) {
        const rowIndex = Math.floor(cursor / 60);
        const rowStart = rowIndex * 60;
        const segEnd = Math.min(visEnd, rowStart + 60);
        segments.push({
            rowIndex,
            hour: hours[rowIndex]!,
            startMin: cursor - rowStart,
            endMin: segEnd - rowStart,
        });
        cursor = segEnd;
    }

    return segments;
}

/** 일요일 시작 달력 주 (월 보기 등) */
export function startOfWeek(date: Date) {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
}

/** 주 보기: 기준일 당일부터 연속 7일 */
export function startOfRollingWeek(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

/** 주 보기 7일 dateKey 목록 (기준일 포함) */
export function rollingWeekDayKeys(anchor: Date): string[] {
    const start = startOfRollingWeek(anchor);
    return Array.from({ length: 7 }, (_, i) => {
        const d = addDays(start, i);
        return dateKey(d.getFullYear(), d.getMonth(), d.getDate());
    });
}

export function isDateInRollingWeek(day: Date, weekStart: Date) {
    const start = startOfRollingWeek(weekStart).getTime();
    const end = addDays(startOfRollingWeek(weekStart), 6).getTime();
    const t = startOfRollingWeek(day).getTime();
    return t >= start && t <= end;
}

export function addDays(date: Date, days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

export function formatWeekRange(weekStart: Date) {
    const end = addDays(weekStart, 6);
    const sameMonth = weekStart.getMonth() === end.getMonth();
    if (sameMonth) {
        return `${weekStart.getFullYear()}년 ${weekStart.getMonth() + 1}월 ${weekStart.getDate()}일 – ${end.getDate()}일`;
    }
    return `${weekStart.getMonth() + 1}/${weekStart.getDate()} – ${end.getMonth() + 1}/${end.getDate()}`;
}

const WEEKDAY_LABELS = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
] as const;

export function formatDayTitle(date: Date) {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function formatDayWeekday(date: Date) {
    return WEEKDAY_LABELS[date.getDay()];
}

export function timeToMinutes(time: string) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}
