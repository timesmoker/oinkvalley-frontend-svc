"use client";

import type { CalendarEntry, CalendarEntryType } from "@/features/calendar/types/calendar";
import {
    CALENDAR_ENTRY_ATTR,
    clipText,
    entryBlockClasses,
    parseDateKey,
} from "@/features/calendar/lib/entryUtils";
import {
    dayKeyFromWeekSpanBarClick,
    MONTH_SPAN_BAR_H,
    type WeekSpanBar,
} from "@/features/calendar/lib/monthLayout";
import EntryTagDots from "@/features/calendar/components/tags/EntryTagDots";
import CreatePreviewResizable, {
    CreatePreviewEdgeShades,
} from "@/features/calendar/components/entry/CreatePreviewResizable";
import {
    CREATE_PREVIEW_ENTRY_ID,
    isCreatePreviewEntry,
} from "@/features/calendar/components/views/month/monthPreview";
import { DATE_HEADER_PT } from "@/features/calendar/components/views/month/MonthDayCell";
import { cn } from "@/lib/utils";

/** 칸 칩 컨테이너(px-1 / sm:px-1.5)와 동일한 좌·우 여백 */
function spanBarEdgeClass(bar: { isStart: boolean; isEnd: boolean }) {
    const one = "w-[calc(100%-0.25rem)] sm:w-[calc(100%-0.375rem)]";
    const both = "w-[calc(100%-0.5rem)] sm:w-[calc(100%-0.75rem)]";

    return cn(
        bar.isStart && "ml-1 sm:ml-1.5",
        bar.isEnd && "mr-1 sm:mr-1.5",
        bar.isStart && bar.isEnd && both,
        bar.isStart && !bar.isEnd && one,
        !bar.isStart && bar.isEnd && one,
        !bar.isStart && !bar.isEnd && "w-full",
    );
}

type MonthWeekSpanBarsProps = {
    weekIndex: number;
    weekKeys: string[];
    spanBars: WeekSpanBar[];
    spanStackHeight: number;
    orderedTagIds: readonly CalendarEntryType[];
    onSelectDay: (day: number) => void;
    onSelectEntry?: (entry: CalendarEntry, dayKey: string) => void;
    onResizeCreatePreview?: boolean;
    onResizeStart: (edge: "start" | "end", event: React.PointerEvent<HTMLDivElement>) => void;
    onMoveStart: (event: React.PointerEvent<HTMLElement>) => void;
    isMovingPreview: boolean;
    onActivateCreatePreview?: (anchorDayKey?: string) => void;
};

/** 주 행 위에 겹쳐 그리는 멀티데이(스팬) 바 레이어 */
export default function MonthWeekSpanBars({
    weekIndex,
    weekKeys,
    spanBars,
    spanStackHeight,
    orderedTagIds,
    onSelectDay,
    onSelectEntry,
    onResizeCreatePreview = false,
    onResizeStart,
    onMoveStart,
    isMovingPreview,
    onActivateCreatePreview,
}: MonthWeekSpanBarsProps) {
    if (spanBars.length === 0) return null;

    return (
        <div
            className={cn(
                "pointer-events-none absolute inset-x-0 grid grid-cols-7 overflow-visible",
                spanBars.some((bar) => isCreatePreviewEntry(bar.entry))
                    ? "z-[30]"
                    : "z-[2]",
            )}
            style={{
                top: DATE_HEADER_PT,
                height: spanStackHeight,
            }}
        >
            {spanBars.map((bar) => {
                const isPreview = isCreatePreviewEntry(bar.entry);
                const previewBarClasses = entryBlockClasses(
                    bar.entry.tags,
                    orderedTagIds,
                    "flex min-w-0 items-center overflow-hidden text-left text-[11px] font-semibold",
                    spanBarEdgeClass(bar),
                    bar.isStart && bar.isEnd && "rounded-md",
                    bar.isStart && !bar.isEnd && "rounded-l-md rounded-r-none",
                    !bar.isStart && bar.isEnd && "rounded-l-none rounded-r-md",
                    !bar.isStart && !bar.isEnd && "rounded-none",
                );
                const barStyle = {
                    gridColumn: `${bar.colStart + 1} / span ${bar.colSpan}`,
                    gridRow: bar.lane + 1,
                    height: MONTH_SPAN_BAR_H,
                    alignSelf: "start",
                } as const;
                const barTitle = bar.entry.note
                    ? `${bar.entry.title} — ${bar.entry.note}`
                    : bar.entry.title;
                const barLabel = bar.isStart ? (
                    <span className="flex min-w-0 items-center gap-0.5">
                        <EntryTagDots
                            tags={bar.entry.tags}
                            orderedTagIds={orderedTagIds}
                        />
                        <span className={cn(clipText, "font-semibold")}>
                            {bar.entry.title}
                        </span>
                    </span>
                ) : null;

                if (bar.entry.id === CREATE_PREVIEW_ENTRY_ID && onResizeCreatePreview) {
                    return (
                        <CreatePreviewResizable
                            key={`${bar.entry.id}-${bar.lane}-${bar.colStart}-${weekIndex}`}
                            orientation="horizontal"
                            showStartHandle
                            showEndHandle
                            onResizeStart={onResizeStart}
                            onMoveStart={onMoveStart}
                            onActivate={() =>
                                onActivateCreatePreview?.(bar.entry.startDate)
                            }
                            isMoving={isMovingPreview}
                            className={previewBarClasses}
                            style={barStyle}
                        >
                            {barLabel}
                        </CreatePreviewResizable>
                    );
                }

                return (
                    <button
                        key={`${bar.entry.id}-${bar.lane}-${bar.colStart}-${weekIndex}`}
                        type="button"
                        {...{ [CALENDAR_ENTRY_ATTR]: "" }}
                        style={barStyle}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isPreview) return;
                            const dayKey = dayKeyFromWeekSpanBarClick(
                                e.clientX,
                                e.currentTarget.getBoundingClientRect(),
                                bar,
                                weekKeys,
                                bar.entry.startDate,
                            );
                            if (onSelectEntry) {
                                onSelectEntry(bar.entry, dayKey);
                            } else {
                                onSelectDay(parseDateKey(dayKey).day);
                            }
                        }}
                        className={cn(
                            previewBarClasses,
                            "pointer-events-auto px-1.5 font-medium",
                            isPreview && "relative select-none",
                        )}
                        title={barTitle}
                    >
                        {isPreview && <CreatePreviewEdgeShades />}
                        {barLabel}
                    </button>
                );
            })}
        </div>
    );
}
