"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import type {
    CalendarEntry,
    CalendarEntryType,
    CalendarEventScope,
    CalendarViewMode,
} from "@/features/calendar/types/calendar";
import { formatMonthTitle } from "@/features/calendar/lib/monthGrid";
import {
    addDays,
    dateKey,
    entriesForDay,
    formatDayTitle,
    formatWeekRange,
    isDateInRollingWeek,
    parseDateKey,
    sortEntriesForDay,
    startOfRollingWeek,
} from "@/features/calendar/lib/entryUtils";
import DaySummaryPanel from "@/features/calendar/components/panel/DaySummaryPanel";
import { useCalendarEntries } from "@/features/calendar/hooks/useCalendarEntries";
import { useCalendarTags } from "@/features/calendar/hooks/useCalendarTags";
import MonthView from "@/features/calendar/components/views/MonthView";
import WeekView from "@/features/calendar/components/views/WeekView";
import DayView from "@/features/calendar/components/views/DayView";
import CalendarLeftSidebar from "@/features/calendar/components/sidebar/CalendarLeftSidebar";
import EntryTypeFilter from "@/features/calendar/components/tags/EntryTypeFilter";
import SidebarMiniCalendar from "@/features/calendar/components/sidebar/SidebarMiniCalendar";
import CalendarSettingsPanel from "@/features/calendar/components/CalendarSettingsPanel";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { cn } from "@/lib/utils";

const VIEW_TABS: { id: CalendarViewMode; label: string }[] = [
    { id: "month", label: "월" },
    { id: "week", label: "주" },
    { id: "day", label: "일" },
];

/** 좌·우 사이드 패널 공통 레일 */
const SIDE_RAIL =
    "flex h-full min-h-0 w-60 shrink-0 flex-col px-2 py-4 lg:w-64";

function daySelectionFromDate(date: Date) {
    return {
        key: dateKey(date.getFullYear(), date.getMonth(), date.getDate()),
        label: formatDayTitle(date),
    };
}

export default function CalendarApp() {
    const today = useMemo(() => new Date(), []);
    const userId = useAuthStore((s) => s.userId);
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const hasHydrated = useAuthStore((s) => s.hasHydrated);
    const calendarEnabled = hasHydrated && isLoggedIn;

    const {
        allTags,
        visibleTags,
        orderedTagIds,
        tagIds,
        defaultVisibleTagIdStrings,
        addTag,
        deleteTag,
        renameTag,
        setTagVisibility,
        setTagHidden,
        followTag,
    } = useCalendarTags({ currentUserId: userId, enabled: calendarEnabled });
    const [eventScope, setEventScope] = useState<CalendarEventScope>("visible");
    const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
    const [viewDate, setViewDate] = useState(() => new Date(today));
    const [typeFilter, setTypeFilter] = useState<Set<CalendarEntryType>>(
        () => new Set(tagIds),
    );
    const [selectedDay, setSelectedDay] = useState(() => daySelectionFromDate(new Date()));
    const [panelEntryId, setPanelEntryId] = useState<string | null>(null);
    const [panelAdding, setPanelAdding] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const handleAddTag = useCallback(
        async (label: string) => {
            const id = await addTag(label);
            if (id) setTypeFilter((prev) => new Set([...prev, id]));
            return id;
        },
        [addTag],
    );

    const handleDeleteTag = useCallback(
        async (id: string) => {
            const removed = await deleteTag(id);
            if (removed) {
                setTypeFilter((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
            }
            return removed;
        },
        [deleteTag],
    );

    const handleFollowTag = useCallback(
        async (tag: Parameters<typeof followTag>[0]) => {
            const id = await followTag(tag);
            if (id) setTypeFilter((prev) => new Set([...prev, id]));
            return id;
        },
        [followTag],
    );

    const handleHiddenTag = useCallback(
        async (id: string, hidden: boolean) => {
            const changed = await setTagHidden(id, hidden);
            if (changed) {
                setTypeFilter((prev) => {
                    const next = new Set(prev);
                    if (hidden) next.delete(id);
                    else next.add(id);
                    return next;
                });
            }
            return changed;
        },
        [setTagHidden],
    );

    useEffect(() => {
        const visible = new Set(tagIds);
        setTypeFilter((prev) => {
            const next = new Set([...prev].filter((id) => visible.has(id)));
            return next.size === prev.size ? prev : next;
        });
    }, [tagIds]);

    useEffect(() => {
        if (defaultVisibleTagIdStrings.length === 0) return;
        setTypeFilter((prev) => {
            const next = new Set(prev);
            let changed = false;
            for (const id of defaultVisibleTagIdStrings) {
                if (tagIds.includes(id) && !next.has(id)) {
                    next.add(id);
                    changed = true;
                }
            }
            return changed ? next : prev;
        });
    }, [defaultVisibleTagIdStrings, tagIds]);

    const { entries, loading, error, authRequired, addEntry, updateEntry, deleteEntry } =
        useCalendarEntries({
            viewMode,
            viewDate,
            typeFilter,
            tagIds,
            scope: eventScope,
            isLoggedIn: calendarEnabled,
            enabled: hasHydrated,
        });

    const toggleTypeFilter = (type: CalendarEntryType) => {
        setTypeFilter((prev) => {
            const next = new Set(prev);
            if (next.has(type)) next.delete(type);
            else next.add(type);
            return next;
        });
    };

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const headerTitle = useMemo(() => {
        if (viewMode === "month") return formatMonthTitle(year, month);
        if (viewMode === "week") return formatWeekRange(startOfRollingWeek(viewDate));
        return formatDayTitle(viewDate);
    }, [viewMode, year, month, viewDate]);

    const isTodayView = useMemo(() => {
        if (viewMode === "month") {
            return year === today.getFullYear() && month === today.getMonth();
        }
        if (viewMode === "week") {
            return isDateInRollingWeek(today, viewDate);
        }
        return (
            viewDate.getFullYear() === today.getFullYear() &&
            viewDate.getMonth() === today.getMonth() &&
            viewDate.getDate() === today.getDate()
        );
    }, [viewMode, year, month, viewDate, today]);

    const goPrev = () => {
        setViewDate((prev) => {
            const d = new Date(prev);
            if (viewMode === "month") {
                d.setDate(1);
                d.setMonth(d.getMonth() - 1);
            } else if (viewMode === "week") d.setDate(d.getDate() - 7);
            else d.setDate(d.getDate() - 1);
            return d;
        });
    };

    const goNext = () => {
        setViewDate((prev) => {
            const d = new Date(prev);
            if (viewMode === "month") {
                d.setDate(1);
                d.setMonth(d.getMonth() + 1);
            } else if (viewMode === "week") d.setDate(d.getDate() + 7);
            else d.setDate(d.getDate() + 1);
            return d;
        });
    };

    const goToday = () => {
        setViewDate(new Date(today));
        setPanelEntryId(null);
        setSelectedDay(daySelectionFromDate(today));
    };

    const selectDayNumber = useCallback(
        (day: number) => {
            setPanelEntryId(null);
            setSelectedDay(daySelectionFromDate(new Date(year, month, day)));
        },
        [year, month],
    );

    const selectDateInCurrentView = useCallback((date: Date) => {
        setPanelEntryId(null);
        setSelectedDay(daySelectionFromDate(date));
    }, []);

    const selectDate = useCallback((date: Date) => {
        setPanelEntryId(null);
        setSelectedDay(daySelectionFromDate(date));
        setViewDate(date);
    }, []);

    const selectEntryFromMain = useCallback(
        (entry: CalendarEntry, dayKey?: string) => {
            setPanelAdding(false);
            setPanelEntryId(entry.id);
            const key = dayKey ?? entry.startDate;
            const { year: y, month: mo, day } = parseDateKey(key);
            const date = new Date(y, mo, day);
            setSelectedDay(daySelectionFromDate(date));
            if (viewMode === "day") setViewDate(date);
        },
        [viewMode],
    );

    const handleSidebarDaySelect = useCallback((date: Date) => {
        selectDateInCurrentView(date);
    }, [selectDateInCurrentView]);

    useEffect(() => {
        if (viewMode !== "day") return;
        const key = dateKey(
            viewDate.getFullYear(),
            viewDate.getMonth(),
            viewDate.getDate(),
        );
        setSelectedDay(daySelectionFromDate(viewDate));
    }, [viewMode, viewDate]);

    const openPanelAdd = useCallback(() => {
        setPanelEntryId(null);
        setPanelAdding(true);
        setSaveError(null);
    }, []);

    const cancelPanelAdd = useCallback(() => {
        setPanelAdding(false);
        setSaveError(null);
    }, []);

    const selectedDayEntries = useMemo(() => {
        if (!selectedDay) return [];
        return sortEntriesForDay(entriesForDay(entries, selectedDay.key));
    }, [selectedDay, entries]);

    const panelEntry = useMemo(() => {
        if (!panelEntryId) return null;
        return entries.find((e) => e.id === panelEntryId) ?? null;
    }, [panelEntryId, entries]);

    useEffect(() => {
        setPanelEntryId(null);
        setPanelAdding(false);
    }, [selectedDay.key]);

    useEffect(() => {
        if (panelEntryId && !panelEntry) {
            setPanelEntryId(null);
        }
    }, [panelEntryId, panelEntry]);

    const handlePanelAddEntry = async (
        entry: Parameters<typeof addEntry>[0],
    ): Promise<void> => {
        setSaveError(null);
        try {
            await addEntry(entry);
        } catch {
            setSaveError("일정을 저장하지 못했습니다.");
            throw new Error("save failed");
        }
    };

    const handlePanelUpdateEntry = useCallback(
        async (entryId: string, entry: Parameters<typeof addEntry>[0]) => {
            setSaveError(null);
            try {
                await updateEntry(entryId, entry);
            } catch {
                setSaveError("일정을 수정하지 못했습니다.");
                throw new Error("update failed");
            }
        },
        [updateEntry],
    );

    const handlePanelDeleteEntry = useCallback(
        async (entryId: string) => {
            setSaveError(null);
            try {
                await deleteEntry(entryId);
                setPanelEntryId(null);
            } catch {
                setSaveError("일정을 삭제하지 못했습니다.");
                throw new Error("delete failed");
            }
        },
        [deleteEntry],
    );

    const showCalendar =
        hasHydrated &&
        !authRequired &&
        (isLoggedIn ? typeFilter.size > 0 : true);
    const showInitialLoading = loading && entries.length === 0;
    const statusMessages = (
        <>
            {showInitialLoading && (
                <p className="px-2 text-sm text-muted-foreground">불러오는 중…</p>
            )}
            {hasHydrated && authRequired && (
                <p className="px-2 text-sm text-muted-foreground">
                    {eventScope === "mine"
                        ? "「내 일정」은 로그인 후 볼 수 있습니다."
                        : "로그인하면 더 많은 일정을 볼 수 있습니다."}{" "}
                    <a href="/login?next=%2Fcalendar" className="underline">
                        로그인
                    </a>
                </p>
            )}
            {error && <p className="px-2 text-sm text-destructive">{error}</p>}
            {isLoggedIn && typeFilter.size === 0 && (
                <p className="px-2 text-sm text-muted-foreground">
                    표시할 태그를 하나 이상 선택하세요.
                </p>
            )}
            {!isLoggedIn && hasHydrated && (
                <p className="px-2 text-xs text-muted-foreground">
                    비로그인: 공개(PUBLIC) 일정만 표시됩니다.
                </p>
            )}
        </>
    );

    return (
        <div className="flex h-full min-h-0 w-full">
            <CalendarLeftSidebar
                className={cn(SIDE_RAIL, "hidden border-r border-border md:flex")}
                viewDate={viewDate}
                today={today}
                viewMode={viewMode}
                selectedDayKey={selectedDay.key}
                onViewDateChange={setViewDate}
                onDaySelect={handleSidebarDaySelect}
                allTags={visibleTags}
                typeFilter={typeFilter}
                onToggleTypeFilter={toggleTypeFilter}
                onSelectAllTypes={() => setTypeFilter(new Set(tagIds))}
                onAddTag={handleAddTag}
                status={statusMessages}
            />

            {/* 가운데: 툴바 + 달력 (+ 오른쪽 일정 패널) */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-3 py-2 sm:gap-3 sm:px-4">
                    <button
                        type="button"
                        onClick={goToday}
                        className="rounded border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted/50"
                    >
                        오늘
                    </button>

                    <div className="flex rounded-md border border-border p-0.5 text-xs">
                        <button
                            type="button"
                            disabled={!isLoggedIn}
                            onClick={() => setEventScope("visible")}
                            className={cn(
                                "rounded px-2 py-1 font-medium transition",
                                eventScope === "visible"
                                    ? "bg-muted text-foreground"
                                    : "text-muted-foreground",
                                !isLoggedIn && "opacity-50",
                            )}
                        >
                            볼 수 있는 일정
                        </button>
                        <button
                            type="button"
                            disabled={!isLoggedIn}
                            onClick={() => setEventScope("mine")}
                            className={cn(
                                "rounded px-2 py-1 font-medium transition",
                                eventScope === "mine"
                                    ? "bg-muted text-foreground"
                                    : "text-muted-foreground",
                                !isLoggedIn && "opacity-50",
                            )}
                        >
                            내 일정
                        </button>
                    </div>

                    <div className="flex items-center">
                        <button
                            type="button"
                            onClick={goPrev}
                            className="rounded-full p-2 hover:bg-muted/60"
                            aria-label="이전"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={goNext}
                            className="rounded-full p-2 hover:bg-muted/60"
                            aria-label="다음"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>

                    <h1 className="min-w-0 flex-1 truncate text-lg font-normal sm:text-xl">
                        {headerTitle}
                    </h1>

                    <div className="flex rounded-md border border-border p-0.5 text-sm">
                        {VIEW_TABS.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => {
                                    if (tab.id === "week" || tab.id === "day") {
                                        const { year: y, month: mo, day } =
                                            parseDateKey(selectedDay.key);
                                        setViewDate(new Date(y, mo, day));
                                    }
                                    setViewMode(tab.id);
                                }}
                                className={cn(
                                    "rounded px-3 py-1 font-medium transition",
                                    viewMode === tab.id
                                        ? "bg-muted text-foreground"
                                        : "text-muted-foreground hover:bg-muted/50",
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => setSettingsOpen(true)}
                        className="rounded-md p-2 text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
                        aria-label="캘린더 설정"
                    >
                        <Settings className="h-5 w-5" />
                    </button>
                </header>

                {/* 모바일: 미니 달력 + 태그 */}
                <div className="border-b border-border px-3 py-3 md:hidden">
                    <SidebarMiniCalendar
                        viewDate={viewDate}
                        today={today}
                        viewMode={viewMode}
                        selectedDayKey={selectedDay.key}
                        onViewDateChange={setViewDate}
                        onDaySelect={handleSidebarDaySelect}
                    />
                    <EntryTypeFilter
                        layout="inline"
                        allTags={visibleTags}
                        active={typeFilter}
                        onToggle={toggleTypeFilter}
                        onSelectAll={() => setTypeFilter(new Set(tagIds))}
                        onAddTag={handleAddTag}
                    />
                    {statusMessages}
                </div>

                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                    {showCalendar && viewMode === "month" && (
                        <MonthView
                            embedded
                            year={year}
                            month={month}
                            today={today}
                            entries={entries}
                            orderedTagIds={orderedTagIds}
                            selectedDayKey={selectedDay.key}
                            onSelectDay={selectDayNumber}
                            onSelectAdjacentDate={selectDateInCurrentView}
                            onSelectEntry={selectEntryFromMain}
                        />
                    )}
                    {showCalendar && viewMode === "week" && (
                        <WeekView
                            embedded
                            viewDate={viewDate}
                            entries={entries}
                            orderedTagIds={orderedTagIds}
                            selectedDayKey={selectedDay.key}
                            onSelectDay={selectDate}
                            onSelectEntry={selectEntryFromMain}
                        />
                    )}
                    {showCalendar && viewMode === "day" && (
                        <DayView
                            viewDate={viewDate}
                            entries={entries}
                            orderedTagIds={orderedTagIds}
                            onSelectEntry={selectEntryFromMain}
                        />
                    )}
                </div>

                {showCalendar && (
                    <DaySummaryPanel
                        className={cn(
                            SIDE_RAIL,
                            "max-h-[40vh] w-full border-t border-border xl:hidden",
                        )}
                        dateKey={selectedDay.key}
                        entries={selectedDayEntries}
                        allTags={allTags}
                        selectedEntry={panelEntry}
                        isAdding={panelAdding}
                        saveError={saveError}
                        onSelectEntry={(entry) => {
                            setPanelAdding(false);
                            setPanelEntryId(entry.id);
                        }}
                        onBackFromEntry={() => setPanelEntryId(null)}
                        onStartAdd={openPanelAdd}
                        onCancelAdd={cancelPanelAdd}
                        onAddEntry={handlePanelAddEntry}
                        onUpdateEntry={handlePanelUpdateEntry}
                        onDeleteEntry={handlePanelDeleteEntry}
                        onAddTag={handleAddTag}
                        defaultOwnerId={userId}
                    />
                )}
            </div>

            {showCalendar && (
                <DaySummaryPanel
                    className={cn(SIDE_RAIL, "hidden border-l border-border xl:flex")}
                    dateKey={selectedDay.key}
                    entries={selectedDayEntries}
                    allTags={allTags}
                    selectedEntry={panelEntry}
                    isAdding={panelAdding}
                    saveError={saveError}
                    onSelectEntry={(entry) => {
                        setPanelAdding(false);
                        setPanelEntryId(entry.id);
                    }}
                    onBackFromEntry={() => setPanelEntryId(null)}
                    onStartAdd={openPanelAdd}
                    onCancelAdd={cancelPanelAdd}
                    onAddEntry={handlePanelAddEntry}
                    onUpdateEntry={handlePanelUpdateEntry}
                    onDeleteEntry={handlePanelDeleteEntry}
                    onAddTag={handleAddTag}
                    defaultOwnerId={userId}
                />
            )}

            <CalendarSettingsPanel
                open={settingsOpen}
                tags={allTags}
                defaultVisibleTagIds={defaultVisibleTagIdStrings}
                currentUserId={userId}
                onClose={() => setSettingsOpen(false)}
                onAddTag={handleAddTag}
                onDeleteTag={handleDeleteTag}
                onVisibilityChange={setTagVisibility}
                onHiddenChange={handleHiddenTag}
                onFollowTag={handleFollowTag}
                onRenameTag={async (id, name) => renameTag(id, name)}
            />
        </div>
    );
}
