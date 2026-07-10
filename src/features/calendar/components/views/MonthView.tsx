"use client";

import { memo, useCallback, useMemo } from "react";
import type {
    CalendarEntry,
    CalendarEntryCreateDefaults,
    CalendarEntryType,
} from "@/features/calendar/types/calendar";
import { buildMonthGrid, WEEKDAYS } from "@/features/calendar/lib/monthGrid";
import { dateKey, parseDateKey } from "@/features/calendar/lib/entryUtils";
import { chunkMonthGrid } from "@/features/calendar/lib/monthLayout";
import { useAllDayPreviewResize } from "@/features/calendar/hooks/useAllDayPreviewResize";
import { useAllDayPreviewMove } from "@/features/calendar/hooks/useAllDayPreviewMove";
import { useAllDayDragCreate } from "@/features/calendar/hooks/useAllDayDragCreate";
import {
    CREATE_PREVIEW_ENTRY_ID,
    DRAG_PREVIEW_ENTRY_ID,
} from "@/features/calendar/components/views/month/monthPreview";
import {
    MonthAdjacentCell,
    MonthDayCell,
} from "@/features/calendar/components/views/month/MonthDayCell";
import MonthWeekSpanBars from "@/features/calendar/components/views/month/MonthWeekSpanBars";
import { useMonthWeekLayouts } from "@/features/calendar/components/views/month/useMonthWeekLayouts";
import { cn } from "@/lib/utils";

type MonthViewProps = {
    year: number;
    month: number;
    today: Date;
    entries: CalendarEntry[];
    orderedTagIds: readonly CalendarEntryType[];
    selectedDayKey?: string | null;
    createPreview?: CalendarEntryCreateDefaults | null;
    retargetEmptySelection?: boolean;
    onSelectDay: (day: number) => void;
    onSelectAdjacentDate?: (date: Date) => void;
    onSelectEntry?: (entry: CalendarEntry, dayKey: string) => void;
    onCreateEntry?: (date: Date, defaults: CalendarEntryCreateDefaults) => void;
    /** 드래그 중 범위 갱신 — 우측 추가 폼 시작/종료일 반영 */
    onCreateDragRange?: (
        date: Date,
        defaults: CalendarEntryCreateDefaults,
        panelAnchorDayKey?: string,
    ) => void;
    /** 드래그를 칸 밖에서 끝낼 때 (빈 추가 폼 취소 등) */
    onCancelCreateDrag?: () => void;
    /** 추가 중 고스트 일정 시작/끝 드래그 조정 */
    onResizeCreatePreview?: (patch: CalendarEntryCreateDefaults) => void;
    onActivateCreatePreview?: (anchorDayKey?: string) => void;
    /** 부모에서 border 처리 시 true */
    embedded?: boolean;
};

function MonthView({
    year,
    month,
    today,
    entries,
    orderedTagIds,
    selectedDayKey,
    createPreview,
    retargetEmptySelection = false,
    onSelectDay,
    onSelectAdjacentDate,
    onSelectEntry,
    onCreateEntry,
    onCreateDragRange,
    onCancelCreateDrag,
    onResizeCreatePreview,
    onActivateCreatePreview,
    embedded = false,
}: MonthViewProps) {
    const grid = buildMonthGrid(year, month);
    const weeks = chunkMonthGrid(grid);
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
    const todayDay = today.getDate();
    const previewTitle = createPreview?.title?.trim() || "새 일정";
    const previewTags =
        createPreview?.tags && createPreview.tags.length > 0
            ? createPreview.tags
            : [orderedTagIds[0] ?? "other"];
    const isInteractivePreview =
        createPreview?.previewKind === "create" || createPreview?.previewKind === "edit";
    const allDayPreviewSchedule =
        isInteractivePreview && createPreview.startDate
            ? {
                  startDate: createPreview.startDate,
                  endDate: createPreview.endDate ?? createPreview.startDate,
              }
            : null;

    /** 폼 초안 고스트 (추가/수정 중) */
    const createPreviewEntry = useMemo<CalendarEntry | null>(() => {
        if (!isInteractivePreview || !createPreview.startDate) {
            return null;
        }
        return {
            id: CREATE_PREVIEW_ENTRY_ID,
            title: previewTitle,
            tags: previewTags,
            ownerId: 0,
            participantIds: [],
            startDate: createPreview.startDate,
            endDate: createPreview.endDate ?? createPreview.startDate,
            allDay: createPreview.allDay ?? true,
            startTime: createPreview.startTime,
            endTime: createPreview.endTime,
        };
    }, [createPreview, isInteractivePreview, previewTags, previewTitle]);

    const notifyDragRange = useCallback(
        (dragStartKey: string, endKey: string) => {
            if (!onCreateDragRange) return;
            const startDate = dragStartKey < endKey ? dragStartKey : endKey;
            const endDate = dragStartKey < endKey ? endKey : dragStartKey;
            const { year: y, month: m, day } = parseDateKey(startDate);
            onCreateDragRange(
                new Date(y, m, day),
                {
                    allDay: true,
                    startDate,
                    endDate,
                },
                dragStartKey,
            );
        },
        [onCreateDragRange],
    );

    const commitDragRange = useCallback(
        (startDate: string, endDate: string) => {
            const { year: y, month: m, day } = parseDateKey(startDate);
            onCreateEntry?.(new Date(y, m, day), {
                allDay: true,
                startDate,
                endDate,
            });
        },
        [onCreateEntry],
    );

    // 상호 의존 해소용 선계산: 드래그 훅에 프리뷰 유무만 알려주면 됨
    const hasFormPreview = createPreviewEntry != null;

    const drag = useAllDayDragCreate({
        enabled: Boolean(onCreateEntry),
        canStartFrom: (dayKey) => {
            if (!retargetEmptySelection && hasFormPreview) return false;
            return selectedDayKey === dayKey || retargetEmptySelection;
        },
        onLiveRange: retargetEmptySelection ? undefined : notifyDragRange,
        onCommit: commitDragRange,
        onCancel: onCancelCreateDrag,
    });

    /** 드래그 중 임시 범위 고스트 */
    const dragPreviewEntry = useMemo<CalendarEntry | null>(() => {
        if (!drag.dragRange) return null;
        const { start, end } = drag.dragRange;
        const startDate = start < end ? start : end;
        const endDate = start < end ? end : start;
        return {
            id: DRAG_PREVIEW_ENTRY_ID,
            title: previewTitle,
            tags: previewTags,
            ownerId: 0,
            participantIds: [],
            startDate,
            endDate,
            allDay: true,
        };
    }, [drag.dragRange, previewTags, previewTitle]);

    const layoutEntries = useMemo(() => {
        const previewEntry = dragPreviewEntry ?? createPreviewEntry;
        return previewEntry ? [...entries, previewEntry] : entries;
    }, [entries, createPreviewEntry, dragPreviewEntry]);

    const { weekRowRefs, weekLayouts, resolveMonthDayKey } = useMonthWeekLayouts(
        weeks,
        layoutEntries,
    );

    /** 프리뷰 리사이즈/이동 대상 스케줄 (드래그 중이면 드래그 범위) */
    const effectiveAllDaySchedule = useMemo(() => {
        if (allDayPreviewSchedule) return allDayPreviewSchedule;
        const preview = dragPreviewEntry ?? createPreviewEntry;
        if (preview && preview.allDay !== false) {
            return { startDate: preview.startDate, endDate: preview.endDate };
        }
        if (!drag.dragRange) return null;
        const { start, end } = drag.dragRange;
        return {
            startDate: start < end ? start : end,
            endDate: start < end ? end : start,
        };
    }, [allDayPreviewSchedule, createPreviewEntry, dragPreviewEntry, drag.dragRange]);

    const handleResizeCreatePreview = useCallback(
        (patch: CalendarEntryCreateDefaults) => {
            onResizeCreatePreview?.(patch);
        },
        [onResizeCreatePreview],
    );

    const allDayPreviewResize = useAllDayPreviewResize(
        effectiveAllDaySchedule,
        handleResizeCreatePreview,
        resolveMonthDayKey,
    );
    const allDayPreviewMove = useAllDayPreviewMove(
        allDayPreviewSchedule,
        handleResizeCreatePreview,
        resolveMonthDayKey,
    );
    const previewGestureActive =
        allDayPreviewResize.isResizing || allDayPreviewMove.isMoving;

    const handleSelectDay = (day: number) => {
        const key = dateKey(year, month, day);
        if (drag.consumeSuppressedClick(key)) return;
        onSelectDay(day);
    };

    const startDrag = (dayKey: string) => {
        if (previewGestureActive) return;
        drag.startDrag(dayKey);
    };

    const isInCreatePreview = (dayKey: string) => {
        if (!createPreview?.startDate) return false;
        const start = createPreview.startDate;
        const end = createPreview.endDate ?? start;
        return dayKey >= start && dayKey <= end;
    };
    const isInDragRange = (dayKey: string) => {
        if (!drag.dragRange) return false;
        const start =
            drag.dragRange.start < drag.dragRange.end
                ? drag.dragRange.start
                : drag.dragRange.end;
        const end =
            drag.dragRange.start < drag.dragRange.end
                ? drag.dragRange.end
                : drag.dragRange.start;
        return dayKey >= start && dayKey <= end;
    };
    /** 선택·추가·수정 프리뷰 및 드래그 중 범위 — 여러날 파란 칸 하이라이트 */
    const shouldCellHighlight = (dayKey: string) =>
        isInDragRange(dayKey) ||
        (Boolean(createPreview?.startDate) && isInCreatePreview(dayKey));

    return (
        <div
            className={cn(
                "flex min-h-0 flex-1 flex-col",
                drag.isDragging && "[&_[data-calendar-entry]]:pointer-events-none",
                !embedded && "border border-border",
            )}
        >
            <div className="grid shrink-0 grid-cols-7 border-b border-border">
                {WEEKDAYS.map((d) => (
                    <span
                        key={d}
                        className="py-2 text-center text-[11px] font-medium text-muted-foreground sm:text-xs"
                    >
                        {d}
                    </span>
                ))}
            </div>

            <div className="flex min-h-0 flex-1 flex-col divide-y divide-border">
                {weekLayouts.map(({ weekKeys, spanBars, spanStackHeight, cells }, wi) => (
                    <div
                        key={wi}
                        ref={(node) => {
                            weekRowRefs.current[wi] = node;
                        }}
                        className="relative grid min-h-0 flex-1 grid-cols-7"
                    >
                        {cells.map((cell, col) => {
                            if (cell.kind === "adjacent") {
                                const key = dateKey(
                                    cell.cell.year,
                                    cell.cell.month,
                                    cell.cell.day,
                                );
                                return (
                                    <MonthAdjacentCell
                                        key={`adj-${wi}-${col}-${cell.cell.year}-${cell.cell.month}-${cell.cell.day}`}
                                        cell={cell.cell}
                                        dayKey={key}
                                        isSelected={selectedDayKey === key}
                                        isPreview={shouldCellHighlight(key)}
                                        onSelectDate={onSelectAdjacentDate}
                                        onDragEnterDay={drag.enterDrag}
                                    />
                                );
                            }

                            return (
                                <MonthDayCell
                                    key={cell.dayKey}
                                    day={cell.day}
                                    dayKey={cell.dayKey}
                                    colSpanHeight={cell.colSpanHeight}
                                    visible={cell.visible}
                                    hiddenCount={cell.hiddenCount}
                                    isToday={isCurrentMonth && cell.day === todayDay}
                                    isSelected={selectedDayKey === cell.dayKey}
                                    isDragPreview={shouldCellHighlight(cell.dayKey)}
                                    orderedTagIds={orderedTagIds}
                                    onSelectDay={handleSelectDay}
                                    onSelectEntry={onSelectEntry}
                                    onDragStartDay={startDrag}
                                    onDragEnterDay={drag.enterDrag}
                                />
                            );
                        })}

                        <MonthWeekSpanBars
                            weekIndex={wi}
                            weekKeys={weekKeys}
                            spanBars={spanBars}
                            spanStackHeight={spanStackHeight}
                            orderedTagIds={orderedTagIds}
                            onSelectDay={onSelectDay}
                            onSelectEntry={onSelectEntry}
                            onResizeCreatePreview={Boolean(onResizeCreatePreview)}
                            onResizeStart={allDayPreviewResize.begin}
                            onMoveStart={allDayPreviewMove.begin}
                            isMovingPreview={allDayPreviewMove.isMoving}
                            onActivateCreatePreview={onActivateCreatePreview}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default memo(MonthView);
