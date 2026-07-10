import type { CalendarEntry } from "@/features/calendar/types/calendar";
import type { MonthGridCell } from "@/features/calendar/lib/monthGrid";
import { monthGridCellKey } from "@/features/calendar/lib/monthGrid";
import { entryBlockStyle, entryOverlapsDay, isMultiDayEntry } from "@/features/calendar/lib/entryUtils";

export const MONTH_CELL_MAX_CHIPS = 2;

export function chunkMonthGrid(grid: MonthGridCell[]): MonthGridCell[][] {
    const weeks: MonthGridCell[][] = [];
    for (let i = 0; i < grid.length; i += 7) {
        weeks.push(grid.slice(i, i + 7));
    }
    return weeks;
}

export function weekDayKeysFromCells(week: MonthGridCell[]) {
    return week.map((cell) => monthGridCellKey(cell));
}

/** 이 주에 걸치는 종일·여러 날 일정 가로 바 */
export type WeekSpanBar = {
    entry: CalendarEntry;
    colStart: number;
    colSpan: number;
    lane: number;
    isStart: boolean;
    isEnd: boolean;
};

export function dayKeyFromWeekSpanBarClick(
    clientX: number,
    barRect: DOMRect,
    bar: Pick<WeekSpanBar, "colStart" | "colSpan">,
    weekKeys: (string | null)[],
    fallback: string,
): string {
    if (barRect.width <= 0) return weekKeys[bar.colStart] ?? fallback;
    const ratio = (clientX - barRect.left) / barRect.width;
    const colOffset = Math.min(
        bar.colSpan - 1,
        Math.max(0, Math.floor(ratio * bar.colSpan)),
    );
    return weekKeys[bar.colStart + colOffset] ?? fallback;
}

export const CREATE_PREVIEW_ENTRY_ID = "__calendar-create-preview__";

export function isMonthSpanBarEntry(entry: CalendarEntry) {
    if (
        entry.id === CREATE_PREVIEW_ENTRY_ID ||
        entry.id === "__calendar-drag-preview__"
    ) {
        return true;
    }
    return entry.allDay && isMultiDayEntry(entry);
}

export function layoutWeekSpanBars(
    weekKeys: (string | null)[],
    entries: CalendarEntry[],
): WeekSpanBar[] {
    const valid = weekKeys.filter((k): k is string => k !== null);
    if (valid.length === 0) return [];

    const weekStart = valid[0];
    const weekEnd = valid[valid.length - 1];

    const candidates = entries.filter(
        (e) =>
            isMonthSpanBarEntry(e) &&
            e.startDate <= weekEnd &&
            e.endDate >= weekStart,
    );

    const raw: Omit<WeekSpanBar, "lane">[] = [];

    for (const entry of candidates) {
        let colStart = -1;
        let colEnd = -1;
        weekKeys.forEach((key, col) => {
            if (!key || !entryOverlapsDay(entry, key)) return;
            if (colStart === -1) colStart = col;
            colEnd = col;
        });
        if (colStart < 0) continue;

        const firstKey = weekKeys[colStart]!;
        const lastKey = weekKeys[colEnd]!;
        raw.push({
            entry,
            colStart,
            colSpan: colEnd - colStart + 1,
            isStart: firstKey === entry.startDate || entry.startDate < weekStart,
            isEnd: lastKey === entry.endDate || entry.endDate > weekEnd,
        });
    }

    raw.sort((a, b) => {
        const previewRank = (entry: CalendarEntry) =>
            entry.id === CREATE_PREVIEW_ENTRY_ID ||
            entry.id === "__calendar-drag-preview__"
                ? 0
                : 1;
        return (
            previewRank(a.entry) - previewRank(b.entry) ||
            a.colStart - b.colStart ||
            b.colSpan - a.colSpan
        );
    });

    const laneEnds: number[] = [];
    const placed: WeekSpanBar[] = [];

    for (const seg of raw) {
        const colEnd = seg.colStart + seg.colSpan - 1;
        let lane = laneEnds.findIndex((end) => seg.colStart > end);
        if (lane === -1) {
            lane = laneEnds.length;
            laneEnds.push(colEnd);
        } else {
            laneEnds[lane] = colEnd;
        }
        placed.push({ ...seg, lane });
    }

    return placed;
}

/** 하루 칸 안에 넣을 칩 (가로 바로 이미 그린 여러 날 종일 제외) */
export function singleDayEntriesForCell(
    entries: CalendarEntry[],
    dayKey: string,
): CalendarEntry[] {
    return entries.filter((e) => {
        if (
            e.id === CREATE_PREVIEW_ENTRY_ID ||
            e.id === "__calendar-drag-preview__"
        ) {
            return false;
        }
        if (e.startDate === e.endDate && e.startDate === dayKey) return true;
        if (!e.allDay && entryOverlapsDay(e, dayKey)) return true;
        if (e.allDay && !isMultiDayEntry(e) && e.startDate === dayKey) return true;
        return false;
    });
}

export function spanLaneCount(bars: WeekSpanBar[]) {
    if (bars.length === 0) return 0;
    return Math.max(...bars.map((b) => b.lane)) + 1;
}

export const MONTH_SPAN_BAR_H = 20;
/** 생성 프리뷰 막대 높이 (기본 대비 ~25%) */
export const MONTH_SPAN_PREVIEW_H = Math.round(MONTH_SPAN_BAR_H * 1.25);
/** 종일 막대 줄 사이 = 칩 사이 = 종일↔칩 (Tailwind gap-1) */
export const MONTH_SPAN_BAR_GAP = 4;
export const MONTH_CHIP_GAP = 4;

export function spanAreaHeight(laneCount: number): number {
    if (laneCount <= 0) return 0;
    return laneCount * MONTH_SPAN_BAR_H + Math.max(0, laneCount - 1) * MONTH_SPAN_BAR_GAP;
}

/** 해당 열에 걸치는 종일 바 높이만 (다른 열은 밀리지 않음) */
export function columnSpanAreaHeight(bars: WeekSpanBar[], col: number): number {
    const covering = bars.filter(
        (b) => col >= b.colStart && col < b.colStart + b.colSpan,
    );
    if (covering.length === 0) return 0;
    const maxLane = Math.max(...covering.map((b) => b.lane));
    return spanAreaHeight(maxLane + 1) + MONTH_CHIP_GAP;
}

export { entryBlockStyle };
