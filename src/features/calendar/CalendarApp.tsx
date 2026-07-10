"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
    CalendarEntry,
    CalendarEntryCreateDefaults,
    CalendarEventScope,
    CalendarViewMode,
} from "@/features/calendar/types/calendar";
import { formatMonthTitle } from "@/features/calendar/lib/monthGrid";
import {
    dateKey,
    entriesForDay,
    formatDayTitle,
    formatWeekRange,
    parseDateKey,
    sortEntriesForDay,
    startOfRollingWeek,
} from "@/features/calendar/lib/entryUtils";
import { daySelectionFromDate } from "@/features/calendar/lib/draftUtils";
import DaySummaryPanel from "@/features/calendar/components/panel/DaySummaryPanel";
import { useCalendarEntries } from "@/features/calendar/hooks/useCalendarEntries";
import { useCalendarTagFilters } from "@/features/calendar/hooks/useCalendarTagFilters";
import { useCalendarEntryDraft } from "@/features/calendar/hooks/useCalendarEntryDraft";
import { useFloatingDayPanel } from "@/features/calendar/hooks/useFloatingDayPanel";
import MonthView from "@/features/calendar/components/views/MonthView";
import WeekView from "@/features/calendar/components/views/WeekView";
import DayView from "@/features/calendar/components/views/DayView";
import CalendarLeftSidebar from "@/features/calendar/components/sidebar/CalendarLeftSidebar";
import CalendarHeader from "@/features/calendar/components/CalendarHeader";
import CalendarSettingsPanel from "@/features/calendar/components/CalendarSettingsPanel";
import MobileTagFilterSheet from "@/features/calendar/components/tags/MobileTagFilterSheet";
import FloatingDayPanelOverlay, {
    floatingDayPanelClass,
} from "@/features/calendar/components/panel/FloatingDayPanelOverlay";
import { SIDE_RAIL } from "@/features/calendar/components/calendarLayout";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { cn } from "@/lib/utils";

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
        renameTag,
        setTagVisibility,
        typeFilter,
        excludedTypeFilter,
        toggleTypeFilter,
        toggleExcludedTypeFilter,
        selectAllTypes,
        handleAddTag,
        handleDeleteTag,
        handleFollowTag,
        handleHiddenTag,
    } = useCalendarTagFilters({ currentUserId: userId, enabled: calendarEnabled });

    const [eventScope, setEventScope] = useState<CalendarEventScope>("visible");
    const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
    const [viewDate, setViewDate] = useState(() => new Date(today));
    const [selectedDay, setSelectedDay] = useState(() =>
        daySelectionFromDate(new Date()),
    );
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [tagPanelOpen, setTagPanelOpen] = useState(false);

    const {
        compactCreate,
        dayPanelOpen,
        dayPanelSide,
        openPanel,
        requestPanel,
        closePanel,
        clearPendingAnchor,
    } = useFloatingDayPanel();

    /** xl 이상으로 커지면 모바일 태그 시트 닫기 */
    useEffect(() => {
        const query = window.matchMedia("(min-width: 1280px)");
        const close = () => {
            if (query.matches) setTagPanelOpen(false);
        };
        close();
        query.addEventListener("change", close);
        return () => query.removeEventListener("change", close);
    }, []);

    const { entries, loading, error, authRequired, addEntry, updateEntry, deleteEntry } =
        useCalendarEntries({
            viewMode,
            viewDate,
            includeTypes: typeFilter,
            excludeTypes: excludedTypeFilter,
            tagIds,
            scope: eventScope,
            isLoggedIn: calendarEnabled,
            enabled: hasHydrated,
        });

    const handleSelectDate = useCallback((date: Date) => {
        setSelectedDay(daySelectionFromDate(date));
    }, []);

    const draft = useCalendarEntryDraft({
        entries,
        addEntry,
        updateEntry,
        deleteEntry,
        userId,
        viewMode,
        selectedDayKey: selectedDay.key,
        onSelectDate: handleSelectDate,
        onViewDateChange: setViewDate,
        requestPanel,
        openPanel,
        clearPendingPanelAnchor: clearPendingAnchor,
    });

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const headerTitle = useMemo(() => {
        if (viewMode === "month") return formatMonthTitle(year, month);
        if (viewMode === "week") return formatWeekRange(startOfRollingWeek(viewDate));
        return formatDayTitle(viewDate);
    }, [viewMode, year, month, viewDate]);

    const closeOverlayPanels = useCallback(() => {
        closePanel();
        setTagPanelOpen(false);
    }, [closePanel]);

    const goPrev = () => {
        closeOverlayPanels();
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
        closeOverlayPanels();
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
        draft.resetAllDrafts();
        setSelectedDay(daySelectionFromDate(today));
        closeOverlayPanels();
    };

    const handleViewModeChange = (mode: CalendarViewMode) => {
        closeOverlayPanels();
        if (mode === "week" || mode === "day") {
            const { year: y, month: mo, day } = parseDateKey(selectedDay.key);
            setViewDate(new Date(y, mo, day));
        }
        setViewMode(mode);
    };

    /** 달력 빈칸 클릭 라우팅: 수정 반영 > 추가 반영 > 목록/추가 전환 */
    const handleDayGridClick = useCallback(
        (date: Date) => {
            const key = dateKey(date.getFullYear(), date.getMonth(), date.getDate());
            const emptyDayDefaults = {
                allDay: true as const,
                startDate: key,
                endDate: key,
            };
            if (draft.editingEntryId && draft.editDraftPreview) {
                draft.applyEditDefaultsForDate(date, emptyDayDefaults);
                return;
            }
            if (draft.panelAdding && (draft.addDraftHasTitle || draft.hasAddDraftInput)) {
                draft.applyAddDefaultsForDate(date, emptyDayDefaults);
                return;
            }
            // 같은 날 상세 중 → 목록
            if (selectedDay.key === key && draft.panelEntryId) {
                draft.clearAddDraft();
                openPanel(key);
                return;
            }
            // 작은 화면: 빈칸은 항상 바로 추가.
            // panelAdding(제목 없는 빈 초안)이어도 목록으로 떨어지지 않게 —
            // 예전엔 !panelAdding 가드 때문에 clearAddDraft+목록으로 빠졌음.
            if (compactCreate) {
                if (entriesForDay(entries, key).length === 0) {
                    draft.applyAddDefaultsForDate(date, emptyDayDefaults);
                    return;
                }
                draft.clearAddDraft();
                setSelectedDay(daySelectionFromDate(date));
                openPanel(key);
                return;
            }
            // 데스크톱: 선택일 목록일 때만 추가
            if (!draft.panelAdding && selectedDay.key === key) {
                draft.applyAddDefaultsForDate(date, emptyDayDefaults);
                return;
            }
            draft.clearAddDraft();
            setSelectedDay(daySelectionFromDate(date));
            openPanel(key);
        },
        [draft, selectedDay.key, compactCreate, entries, openPanel],
    );

    const selectDayNumber = useCallback(
        (day: number) => {
            handleDayGridClick(new Date(year, month, day));
        },
        [year, month, handleDayGridClick],
    );

    const selectDateInCurrentView = useCallback(
        (date: Date) => {
            handleDayGridClick(date);
        },
        [handleDayGridClick],
    );

    /** 사이드바 미니 달력 등 — 뷰 날짜까지 이동 */
    const selectDate = useCallback(
        (date: Date) => {
            const key = dateKey(date.getFullYear(), date.getMonth(), date.getDate());
            if (draft.editingEntryId && draft.editDraftPreview) {
                draft.applyEditDefaultsForDate(date, {
                    allDay: true,
                    startDate: key,
                    endDate: key,
                });
                return;
            }
            if (draft.panelAdding && (draft.addDraftHasTitle || draft.hasAddDraftInput)) {
                draft.applyAddDefaultsForDate(date, {
                    allDay: true,
                    startDate: key,
                    endDate: key,
                });
                return;
            }
            draft.clearAddDraft();
            setSelectedDay(daySelectionFromDate(date));
            setViewDate(date);
            openPanel(key);
        },
        [draft, openPanel],
    );

    /** 달력 위 일정 클릭: 수정/추가 반영 또는 상세·목록 열기 */
    const selectEntryFromMain = useCallback(
        (entry: CalendarEntry, dayKey?: string) => {
            if (draft.editingEntryId && draft.editDraftPreview) {
                draft.applyEditDefaultsForEntry(entry, dayKey);
                return;
            }
            if (draft.panelAdding && (draft.addDraftHasTitle || draft.hasAddDraftInput)) {
                draft.applyAddDefaultsForEntry(entry, dayKey);
                return;
            }
            const key = dayKey ?? entry.startDate;
            const { year: y, month: mo, day } = parseDateKey(key);
            const date = new Date(y, mo, day);
            draft.setPanelAdding(false);
            draft.setCreateDefaults(null);
            draft.resetAddDraftPreview();
            draft.resetEditDraftPreview();
            setSelectedDay(daySelectionFromDate(date));
            if (viewMode === "day") setViewDate(date);
            // 이미 선택된 날의 일정 → 상세, 다른 날 → 그날 목록
            draft.setPanelEntryId(key === selectedDay.key ? entry.id : null);
            openPanel(key);
        },
        [draft, viewMode, selectedDay.key, openPanel],
    );

    /** 빈칸/타임라인에서 일정 추가 시작 (드래그 종료 포함) */
    const startAddForDate = useCallback(
        (date: Date, defaults?: CalendarEntryCreateDefaults) => {
            const key = dateKey(date.getFullYear(), date.getMonth(), date.getDate());
            if (draft.editingEntryId && draft.editDraftPreview) {
                draft.applyEditDefaultsForDate(date, defaults);
                return;
            }
            // 빈 추가 중 + defaults 없음: compact는 그날 추가로 유지, 데스크톱만 목록으로
            if (
                draft.panelAdding &&
                !draft.addDraftHasTitle &&
                !draft.hasAddDraftInput &&
                !defaults
            ) {
                if (compactCreate) {
                    draft.applyAddDefaultsForDate(date, {
                        allDay: true,
                        startDate: key,
                        endDate: key,
                    });
                    return;
                }
                draft.clearAddDraft();
                setSelectedDay(daySelectionFromDate(date));
                if (viewMode === "day") setViewDate(date);
                openPanel(key);
                return;
            }
            draft.applyAddDefaultsForDate(date, defaults);
        },
        [draft, compactCreate, viewMode, openPanel],
    );

    const handleSidebarDaySelect = useCallback(
        (date: Date) => {
            selectDateInCurrentView(date);
        },
        [selectDateInCurrentView],
    );

    useEffect(() => {
        if (viewMode !== "day") return;
        setSelectedDay(daySelectionFromDate(viewDate));
    }, [viewMode, viewDate]);

    const selectedDayEntries = useMemo(
        () => sortEntriesForDay(entriesForDay(entries, selectedDay.key)),
        [selectedDay.key, entries],
    );

    const retargetEmptySelection =
        compactCreate ||
        (draft.panelAdding && draft.addDraftHasTitle) ||
        Boolean(draft.editingEntryId);

    const showCalendar = hasHydrated && !authRequired;
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
            {isLoggedIn && typeFilter.size === 0 && excludedTypeFilter.size === 0 && (
                <p className="px-2 text-xs text-muted-foreground">
                    + 태그가 없으면 일정이 표시되지 않습니다. 전체를 누르면 모든
                    태그가 다시 표시됩니다.
                </p>
            )}
            {!isLoggedIn && hasHydrated && (
                <p className="px-2 text-xs text-muted-foreground">
                    비로그인: 공개(PUBLIC) 일정만 표시됩니다.
                </p>
            )}
        </>
    );

    /** 데스크톱 레일·모바일 오버레이 공용 일정 패널 props */
    const daySummaryProps = {
        dateKey: selectedDay.key,
        entries: selectedDayEntries,
        allTags,
        selectedEntry: draft.panelEntry,
        editingEntryId: draft.editingEntryId,
        isAdding: draft.panelAdding,
        createDefaults: draft.panelCreateDefaults,
        editDefaults: draft.panelEditDefaults,
        saveError: draft.saveError,
        onSelectEntry: (entry: CalendarEntry) => {
            draft.setPanelAdding(false);
            draft.setPanelEntryId(entry.id);
            draft.resetAddDraftPreview();
        },
        onBackFromEntry: () => draft.setPanelEntryId(null),
        onStartEdit: draft.startEditEntry,
        onCancelEdit: draft.resetEditDraftPreview,
        onStartAdd: draft.openPanelAdd,
        onCancelAdd: draft.cancelPanelAdd,
        onAddEntry: draft.handlePanelAddEntry,
        onUpdateEntry: draft.handlePanelUpdateEntry,
        onDeleteEntry: draft.handlePanelDeleteEntry,
        onAddTag: handleAddTag,
        onAddDraftHasTitleChange: draft.setAddDraftHasTitle,
        onAddDraftPreviewChange: draft.handleAddDraftPreviewChange,
        onEditDraftPreviewChange: draft.handleEditDraftPreviewChange,
        defaultOwnerId: userId,
    };

    const commonViewProps = {
        entries: draft.calendarEntries,
        orderedTagIds,
        createPreview: draft.activeRangePreview,
        onCreateEntry: startAddForDate,
        onCreateDragRange: draft.applyActiveDragDefaultsForDate,
        onSelectEntry: selectEntryFromMain,
        onResizeCreatePreview: draft.resizeActivePreviewSchedule,
        onActivateCreatePreview: draft.activateAddDraftPanel,
    };

    const pageScrollOnSmall = viewMode === "week" || viewMode === "day";

    return (
        <div
            className={cn(
                "flex w-full",
                pageScrollOnSmall
                    ? "h-auto min-h-[calc(100dvh-5rem)] md:h-full md:min-h-0"
                    : "h-[calc(100dvh-5rem)] min-h-0 md:h-full",
            )}
        >
            <CalendarLeftSidebar
                className={cn(SIDE_RAIL, "hidden border-r border-border xl:flex")}
                viewDate={viewDate}
                today={today}
                viewMode={viewMode}
                selectedDayKey={selectedDay.key}
                onViewDateChange={setViewDate}
                onDaySelect={handleSidebarDaySelect}
                allTags={visibleTags}
                typeFilter={typeFilter}
                excludedTypeFilter={excludedTypeFilter}
                onToggleTypeFilter={toggleTypeFilter}
                onToggleExcludedTypeFilter={toggleExcludedTypeFilter}
                onSelectAllTypes={selectAllTypes}
                onAddTag={handleAddTag}
                status={statusMessages}
            />

            {/* 가운데: 툴바 + 달력 (+ 오른쪽 일정 패널) */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <CalendarHeader
                    title={headerTitle}
                    viewMode={viewMode}
                    eventScope={eventScope}
                    isLoggedIn={isLoggedIn}
                    onGoToday={goToday}
                    onGoPrev={goPrev}
                    onGoNext={goNext}
                    onEventScopeChange={setEventScope}
                    onViewModeChange={handleViewModeChange}
                    onOpenTagPanel={() => {
                        closePanel();
                        setTagPanelOpen(true);
                    }}
                    onOpenSettings={() => setSettingsOpen(true)}
                />

                <div
                    className={cn(
                        "flex min-w-0 flex-1 flex-col",
                        pageScrollOnSmall
                            ? "overflow-visible md:min-h-0 md:overflow-hidden"
                            : "min-h-0 overflow-hidden",
                    )}
                >
                    {showCalendar && viewMode === "month" && (
                        <MonthView
                            embedded
                            year={year}
                            month={month}
                            today={today}
                            selectedDayKey={selectedDay.key}
                            retargetEmptySelection={retargetEmptySelection}
                            onSelectDay={selectDayNumber}
                            onSelectAdjacentDate={selectDateInCurrentView}
                            onCancelCreateDrag={draft.cancelCreateDrag}
                            {...commonViewProps}
                        />
                    )}
                    {showCalendar && viewMode === "week" && (
                        <WeekView
                            embedded
                            viewDate={viewDate}
                            selectedDayKey={selectedDay.key}
                            retargetEmptySelection={retargetEmptySelection}
                            onSelectDay={selectDateInCurrentView}
                            onCancelCreateDrag={draft.cancelCreateDrag}
                            {...commonViewProps}
                        />
                    )}
                    {showCalendar && viewMode === "day" && (
                        <DayView
                            viewDate={viewDate}
                            deferCreatePanelUntilDrag={compactCreate}
                            {...commonViewProps}
                        />
                    )}
                </div>
            </div>

            {showCalendar && !compactCreate && (
                <DaySummaryPanel
                    className={cn(SIDE_RAIL, "border-l border-border")}
                    {...daySummaryProps}
                />
            )}

            {tagPanelOpen && (
                <MobileTagFilterSheet
                    onClose={() => setTagPanelOpen(false)}
                    status={statusMessages}
                    allTags={visibleTags}
                    included={typeFilter}
                    excluded={excludedTypeFilter}
                    onToggleInclude={toggleTypeFilter}
                    onToggleExclude={toggleExcludedTypeFilter}
                    onSelectAll={selectAllTypes}
                    onAddTag={handleAddTag}
                />
            )}

            {showCalendar && compactCreate && dayPanelOpen && (
                <FloatingDayPanelOverlay side={dayPanelSide} onClose={closePanel}>
                    <DaySummaryPanel
                        className={floatingDayPanelClass(dayPanelSide)}
                        {...daySummaryProps}
                    />
                </FloatingDayPanelOverlay>
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
