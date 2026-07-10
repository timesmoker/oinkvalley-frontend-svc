"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
    CalendarEntry,
    CalendarEntryCreateDefaults,
    CalendarEntryDraftPreview,
    CalendarViewMode,
} from "@/features/calendar/types/calendar";
import { dateKey, parseDateKey } from "@/features/calendar/lib/entryUtils";
import {
    calendarErrorMessage,
    defaultsFromDraft,
    draftFromEntry,
    mergeSchedulePatchIntoDraft,
} from "@/features/calendar/lib/draftUtils";
import type {
    CreateCalendarEntryRequest,
    UpdateCalendarEntryRequest,
} from "@/features/calendar/api/calendarTypes";

type UseCalendarEntryDraftArgs = {
    entries: CalendarEntry[];
    addEntry: (entry: CreateCalendarEntryRequest) => Promise<unknown>;
    updateEntry: (
        entryId: string,
        entry: UpdateCalendarEntryRequest,
    ) => Promise<unknown>;
    deleteEntry: (entryId: string) => Promise<unknown>;
    userId: number | null | undefined;
    viewMode: CalendarViewMode;
    selectedDayKey: string;
    /** 선택일 동기화 (달력 하이라이트 + 패널 날짜) */
    onSelectDate: (date: Date) => void;
    onViewDateChange: (date: Date) => void;
    /** 드래그 중이면 pointerup 이후로 미뤄 여는 패널 요청 */
    requestPanel: (anchorDayKey: string) => void;
    /** 즉시 패널 열기 (포인터가 이미 떨어진 컨텍스트) */
    openPanel: (anchorDayKey?: string) => void;
    clearPendingPanelAnchor: () => void;
};

/**
 * 일정 추가/수정 초안 상태 머신.
 * - add: 추가 폼 초안(addDraftPreview) + 생성 기본값(createDefaults)
 * - edit: 수정 중 항목(editingEntryId) + 수정 초안(editDraftPreview)
 * - 달력 뷰에 표시할 고스트 프리뷰(activeRangePreview) 파생
 */
export function useCalendarEntryDraft({
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    userId,
    viewMode,
    selectedDayKey,
    onSelectDate,
    onViewDateChange,
    requestPanel,
    openPanel,
    clearPendingPanelAnchor,
}: UseCalendarEntryDraftArgs) {
    const [panelAdding, setPanelAdding] = useState(false);
    const [panelEntryId, setPanelEntryId] = useState<string | null>(null);
    const [createDefaults, setCreateDefaults] =
        useState<CalendarEntryCreateDefaults | null>(null);
    const [addDraftHasTitle, setAddDraftHasTitle] = useState(false);
    const [addDraftPreview, setAddDraftPreview] =
        useState<CalendarEntryDraftPreview>({ title: "", tags: [] });
    const addDraftPreviewRef = useRef(addDraftPreview);
    const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
    const [editDraftPreview, setEditDraftPreview] =
        useState<CalendarEntryDraftPreview | null>(null);
    const editDraftPreviewRef = useRef<CalendarEntryDraftPreview | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    const hasAddDraftInput = panelAdding && addDraftPreview.title.trim().length > 0;

    useEffect(() => {
        addDraftPreviewRef.current = addDraftPreview;
    }, [addDraftPreview]);

    useEffect(() => {
        editDraftPreviewRef.current = editDraftPreview;
    }, [editDraftPreview]);

    const resetAddDraftPreview = useCallback(() => {
        const emptyDraft: CalendarEntryDraftPreview = { title: "", tags: [] };
        addDraftPreviewRef.current = emptyDraft;
        setAddDraftPreview(emptyDraft);
        setAddDraftHasTitle(false);
    }, []);

    const resetEditDraftPreview = useCallback(() => {
        editDraftPreviewRef.current = null;
        setEditDraftPreview(null);
        setEditingEntryId(null);
    }, []);

    /** 추가 초안·상세 선택만 초기화 (수정 초안은 유지) */
    const clearAddDraft = useCallback(() => {
        setPanelEntryId(null);
        setPanelAdding(false);
        setCreateDefaults(null);
        resetAddDraftPreview();
    }, [resetAddDraftPreview]);

    /** 추가/수정/선택 상태 전부 초기화 (오늘 이동 등) */
    const resetAllDrafts = useCallback(() => {
        clearAddDraft();
        resetEditDraftPreview();
    }, [clearAddDraft, resetEditDraftPreview]);

    const normalizedCreateDefaultsForDate = useCallback(
        (date: Date, defaults?: CalendarEntryCreateDefaults) => {
            const key = dateKey(date.getFullYear(), date.getMonth(), date.getDate());
            return {
                key,
                defaults: {
                    ...defaults,
                    startDate: defaults?.startDate ?? key,
                    endDate: defaults?.endDate ?? defaults?.startDate ?? key,
                },
            };
        },
        [],
    );

    const applyAddDefaultsForDate = useCallback(
        (
            date: Date,
            defaults?: CalendarEntryCreateDefaults,
            panelAnchorDayKey?: string,
        ) => {
            const normalized = normalizedCreateDefaultsForDate(date, defaults);
            const nextDraft = mergeSchedulePatchIntoDraft(addDraftPreviewRef.current, {
                allDay: normalized.defaults.allDay ?? addDraftPreviewRef.current.allDay,
                startDate: normalized.defaults.startDate,
                endDate: normalized.defaults.endDate,
                startTime:
                    normalized.defaults.startTime ?? addDraftPreviewRef.current.startTime,
                endTime:
                    normalized.defaults.endTime ?? addDraftPreviewRef.current.endTime,
            });
            addDraftPreviewRef.current = nextDraft;
            setPanelEntryId(null);
            setPanelAdding(true);
            setAddDraftPreview(nextDraft);
            setAddDraftHasTitle(nextDraft.title.trim().length > 0);
            setCreateDefaults((prev) => defaultsFromDraft(prev, nextDraft));
            onSelectDate(date);
            requestPanel(
                panelAnchorDayKey ??
                    normalized.defaults.startDate ??
                    dateKey(date.getFullYear(), date.getMonth(), date.getDate()),
            );
        },
        [normalizedCreateDefaultsForDate, onSelectDate, requestPanel],
    );

    const applyAddDefaultsForEntry = useCallback(
        (entry: CalendarEntry, dayKey?: string) => {
            const key = dayKey ?? entry.startDate;
            const { year: y, month: mo, day } = parseDateKey(key);
            const nextDraft = mergeSchedulePatchIntoDraft(addDraftPreviewRef.current, {
                allDay: entry.allDay,
                startDate: entry.startDate,
                endDate: entry.endDate,
                startTime: entry.startTime,
                endTime: entry.endTime,
            });
            addDraftPreviewRef.current = nextDraft;
            setPanelEntryId(null);
            setPanelAdding(true);
            setAddDraftPreview(nextDraft);
            setAddDraftHasTitle(nextDraft.title.trim().length > 0);
            setCreateDefaults(defaultsFromDraft(null, nextDraft));
            onSelectDate(new Date(y, mo, day));
            requestPanel(key);
        },
        [onSelectDate, requestPanel],
    );

    const applyEditPatch = useCallback(
        (patch: Partial<CalendarEntryDraftPreview>, panelAnchorDayKey?: string) => {
            const current = editDraftPreviewRef.current;
            if (!editingEntryId || !current) return;
            const nextDraft = mergeSchedulePatchIntoDraft(current, patch);
            editDraftPreviewRef.current = nextDraft;
            setEditDraftPreview(nextDraft);
            const anchor = panelAnchorDayKey ?? nextDraft.startDate ?? selectedDayKey;
            const { year: y, month: mo, day } = parseDateKey(anchor);
            const date = new Date(y, mo, day);
            onSelectDate(date);
            if (viewMode === "day") onViewDateChange(date);
            requestPanel(anchor);
        },
        [
            editingEntryId,
            onSelectDate,
            onViewDateChange,
            requestPanel,
            selectedDayKey,
            viewMode,
        ],
    );

    const applyEditDefaultsForDate = useCallback(
        (
            date: Date,
            defaults?: CalendarEntryCreateDefaults,
            panelAnchorDayKey?: string,
        ) => {
            const key = dateKey(date.getFullYear(), date.getMonth(), date.getDate());
            const current = editDraftPreviewRef.current;
            const startDate = defaults?.startDate ?? key;
            applyEditPatch(
                {
                    allDay:
                        current?.allDay === false ? false : defaults?.allDay ?? true,
                    startDate,
                    endDate:
                        current?.allDay === false
                            ? startDate
                            : defaults?.endDate ?? defaults?.startDate ?? key,
                    startTime: defaults?.startTime,
                    endTime: defaults?.endTime,
                },
                panelAnchorDayKey ?? startDate,
            );
        },
        [applyEditPatch],
    );

    const applyEditDefaultsForEntry = useCallback(
        (entry: CalendarEntry, dayKey?: string) => {
            applyEditPatch(
                {
                    allDay: entry.allDay,
                    startDate: entry.startDate,
                    endDate: entry.endDate,
                    startTime: entry.startTime,
                    endTime: entry.endTime,
                },
                dayKey ?? entry.startDate,
            );
        },
        [applyEditPatch],
    );

    /** 드래그 범위 갱신 — 수정 중이면 수정 초안, 아니면 추가 초안에 반영 */
    const applyActiveDragDefaultsForDate = useCallback(
        (
            date: Date,
            defaults: CalendarEntryCreateDefaults,
            panelAnchorDayKey?: string,
        ) => {
            if (editingEntryId && editDraftPreview) {
                applyEditDefaultsForDate(date, defaults, panelAnchorDayKey);
                return;
            }
            applyAddDefaultsForDate(date, defaults, panelAnchorDayKey);
        },
        [
            editingEntryId,
            editDraftPreview,
            applyEditDefaultsForDate,
            applyAddDefaultsForDate,
        ],
    );

    const openPanelAdd = useCallback(() => {
        setPanelEntryId(null);
        setPanelAdding(true);
        setCreateDefaults(null);
        resetAddDraftPreview();
        resetEditDraftPreview();
        setSaveError(null);
        openPanel(selectedDayKey);
    }, [openPanel, resetAddDraftPreview, resetEditDraftPreview, selectedDayKey]);

    const cancelPanelAdd = useCallback(() => {
        setPanelAdding(false);
        setCreateDefaults(null);
        resetAddDraftPreview();
        setSaveError(null);
    }, [resetAddDraftPreview]);

    /** 빈(제목 없는) 추가 초안이면 드래그 취소 시 폼도 닫음 */
    const cancelCreateDrag = useCallback(() => {
        if (panelAdding && !addDraftHasTitle && !hasAddDraftInput) cancelPanelAdd();
    }, [panelAdding, addDraftHasTitle, hasAddDraftInput, cancelPanelAdd]);

    /** 고스트 프리뷰 핸들 리사이즈/이동 반영 */
    const resizeActivePreviewSchedule = useCallback(
        (patch: Partial<CalendarEntryDraftPreview>) => {
            if (editingEntryId && editDraftPreviewRef.current) {
                applyEditPatch(patch);
                return;
            }
            const nextDraft = mergeSchedulePatchIntoDraft(
                addDraftPreviewRef.current,
                patch,
            );
            addDraftPreviewRef.current = nextDraft;
            setPanelAdding(true);
            setPanelEntryId(null);
            setAddDraftPreview(nextDraft);
            setAddDraftHasTitle(nextDraft.title.trim().length > 0);
            setCreateDefaults((prev) => defaultsFromDraft(prev, nextDraft));
            const anchor = patch.startDate ?? nextDraft.startDate ?? selectedDayKey;
            requestPanel(anchor);
        },
        [editingEntryId, applyEditPatch, requestPanel, selectedDayKey],
    );

    /** 고스트 프리뷰 탭 → 해당 초안의 패널 활성화 */
    const activateAddDraftPanel = useCallback(
        (anchorDayKey?: string) => {
            if (editingEntryId && editDraftPreviewRef.current) {
                clearPendingPanelAnchor();
                setPanelEntryId(editingEntryId);
                openPanel(
                    anchorDayKey ??
                        editDraftPreviewRef.current.startDate ??
                        selectedDayKey,
                );
                return;
            }
            if (!panelAdding) return;
            clearPendingPanelAnchor();
            setPanelEntryId(null);
            openPanel(
                anchorDayKey ??
                    addDraftPreviewRef.current.startDate ??
                    createDefaults?.startDate ??
                    selectedDayKey,
            );
        },
        [
            createDefaults?.startDate,
            editingEntryId,
            clearPendingPanelAnchor,
            openPanel,
            panelAdding,
            selectedDayKey,
        ],
    );

    const handleAddDraftPreviewChange = useCallback(
        (draft: CalendarEntryDraftPreview) => {
            addDraftPreviewRef.current = draft;
            setAddDraftPreview(draft);
            setAddDraftHasTitle(draft.title.trim().length > 0);
            setCreateDefaults((prev) => defaultsFromDraft(prev, draft));
        },
        [],
    );

    const startEditEntry = useCallback(
        (entry: CalendarEntry) => {
            if (userId == null || entry.ownerId !== userId) return;
            const draft = draftFromEntry(entry);
            editDraftPreviewRef.current = draft;
            setEditDraftPreview(draft);
            setEditingEntryId(entry.id);
            setPanelAdding(false);
            setCreateDefaults(null);
            resetAddDraftPreview();
            setPanelEntryId(entry.id);
        },
        [resetAddDraftPreview, userId],
    );

    const handleEditDraftPreviewChange = useCallback(
        (draft: CalendarEntryDraftPreview) => {
            if (!editingEntryId) return;
            editDraftPreviewRef.current = draft;
            setEditDraftPreview(draft);
        },
        [editingEntryId],
    );

    /** 추가 초안의 시작일이 바뀌면 선택일 따라가기 */
    useEffect(() => {
        if (!panelAdding || !addDraftPreview.startDate) return;
        if (addDraftPreview.startDate === selectedDayKey) return;
        const { year: y, month: mo, day } = parseDateKey(addDraftPreview.startDate);
        const date = new Date(y, mo, day);
        onSelectDate(date);
        if (viewMode === "day") onViewDateChange(date);
    }, [
        panelAdding,
        addDraftPreview.startDate,
        selectedDayKey,
        viewMode,
        onSelectDate,
        onViewDateChange,
    ]);

    const panelEntry = useMemo(() => {
        if (!panelEntryId) return null;
        return entries.find((e) => e.id === panelEntryId) ?? null;
    }, [panelEntryId, entries]);

    useEffect(() => {
        if (panelEntryId && !panelEntry) {
            setPanelEntryId(null);
        }
    }, [panelEntryId, panelEntry]);

    /** 수정 중 원본은 달력에서 숨김 (고스트 프리뷰가 대신 표시) */
    const calendarEntries = useMemo(() => {
        if (!editingEntryId || !editDraftPreview) return entries;
        return entries.filter((entry) => entry.id !== editingEntryId);
    }, [editDraftPreview, editingEntryId, entries]);

    const panelCreateDefaults = useMemo(
        () =>
            panelAdding
                ? defaultsFromDraft(createDefaults, addDraftPreview)
                : createDefaults,
        [addDraftPreview, createDefaults, panelAdding],
    );

    const panelEditDefaults = useMemo(
        () =>
            editingEntryId && editDraftPreview
                ? defaultsFromDraft(null, editDraftPreview)
                : null,
        [editDraftPreview, editingEntryId],
    );

    /** 달력 뷰에 그릴 활성 범위 프리뷰 (수정 > 추가 > 선택 순) */
    const activeRangePreview = useMemo<CalendarEntryCreateDefaults | null>(() => {
        if (editingEntryId && editDraftPreview) {
            const startDate = editDraftPreview.startDate;
            if (!startDate) return null;
            return {
                allDay: editDraftPreview.allDay ?? true,
                startDate,
                endDate: editDraftPreview.endDate ?? startDate,
                startTime: editDraftPreview.startTime,
                endTime: editDraftPreview.endTime,
                title: editDraftPreview.title,
                tags: editDraftPreview.tags,
                previewKind: "edit",
            };
        }
        if (panelAdding) {
            const startDate = addDraftPreview.startDate ?? createDefaults?.startDate;
            if (!startDate) return null;
            return {
                ...createDefaults,
                allDay: addDraftPreview.allDay ?? createDefaults?.allDay ?? true,
                startDate,
                endDate:
                    addDraftPreview.endDate ?? createDefaults?.endDate ?? startDate,
                startTime: addDraftPreview.startTime ?? createDefaults?.startTime,
                endTime: addDraftPreview.endTime ?? createDefaults?.endTime,
                title: addDraftPreview.title.trim() || "새 일정",
                tags: addDraftPreview.tags,
                previewKind: "create",
            };
        }
        if (!panelEntry) return null;
        return {
            allDay: panelEntry.allDay,
            startDate: panelEntry.startDate,
            endDate: panelEntry.endDate,
            startTime: panelEntry.startTime,
            endTime: panelEntry.endTime,
            title: panelEntry.title,
            tags: panelEntry.tags,
            previewKind: "selected",
        };
    }, [
        editingEntryId,
        editDraftPreview,
        panelAdding,
        createDefaults,
        addDraftPreview,
        panelEntry,
    ]);

    const handlePanelAddEntry = useCallback(
        async (entry: CreateCalendarEntryRequest): Promise<void> => {
            setSaveError(null);
            try {
                await addEntry(entry);
            } catch (error) {
                setSaveError(calendarErrorMessage(error, "일정을 저장하지 못했습니다."));
                throw new Error("save failed");
            }
        },
        [addEntry],
    );

    const handlePanelUpdateEntry = useCallback(
        async (entryId: string, entry: UpdateCalendarEntryRequest) => {
            setSaveError(null);
            try {
                await updateEntry(entryId, entry);
                resetEditDraftPreview();
            } catch (error) {
                setSaveError(calendarErrorMessage(error, "일정을 수정하지 못했습니다."));
                throw new Error("update failed");
            }
        },
        [resetEditDraftPreview, updateEntry],
    );

    const handlePanelDeleteEntry = useCallback(
        async (entryId: string) => {
            setSaveError(null);
            try {
                await deleteEntry(entryId);
                setPanelEntryId(null);
                resetEditDraftPreview();
            } catch (error) {
                setSaveError(calendarErrorMessage(error, "일정을 삭제하지 못했습니다."));
                throw new Error("delete failed");
            }
        },
        [deleteEntry, resetEditDraftPreview],
    );

    return {
        // 상태
        panelAdding,
        setPanelAdding,
        panelEntryId,
        setPanelEntryId,
        createDefaults,
        setCreateDefaults,
        addDraftHasTitle,
        setAddDraftHasTitle,
        addDraftPreview,
        editingEntryId,
        editDraftPreview,
        saveError,
        hasAddDraftInput,
        // 파생
        panelEntry,
        calendarEntries,
        panelCreateDefaults,
        panelEditDefaults,
        activeRangePreview,
        // 동작
        resetAddDraftPreview,
        resetEditDraftPreview,
        clearAddDraft,
        resetAllDrafts,
        applyAddDefaultsForDate,
        applyAddDefaultsForEntry,
        applyEditDefaultsForDate,
        applyEditDefaultsForEntry,
        applyActiveDragDefaultsForDate,
        openPanelAdd,
        cancelPanelAdd,
        cancelCreateDrag,
        resizeActivePreviewSchedule,
        activateAddDraftPanel,
        handleAddDraftPreviewChange,
        startEditEntry,
        handleEditDraftPreviewChange,
        handlePanelAddEntry,
        handlePanelUpdateEntry,
        handlePanelDeleteEntry,
    };
}
