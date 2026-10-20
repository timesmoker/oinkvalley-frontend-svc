"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import type {
    CalendarEntry,
    CalendarEntryType,
    CalendarEventScope,
    CalendarViewMode,
} from "@/features/calendar/types/calendar";
import {
    createCalendarEntry,
    deleteCalendarEntry,
    fetchCalendarEntries,
    updateCalendarEntry,
} from "@/features/calendar/api/calendarApi";
import type {
    CreateCalendarEntryRequest,
    FetchCalendarEntriesParams,
    UpdateCalendarEntryRequest,
} from "@/features/calendar/api/calendarTypes";
import {
    calendarRangeForView,
    entryOverlapsRange,
    entryPassesTagFilter,
    typesForApiQuery,
} from "@/features/calendar/lib/entryUtils";

type UseCalendarEntriesArgs = {
    viewMode: CalendarViewMode;
    viewDate: Date;
    includeTypes: ReadonlySet<CalendarEntryType>;
    excludeTypes: ReadonlySet<CalendarEntryType>;
    tagIds: CalendarEntryType[];
    scope: CalendarEventScope;
    isLoggedIn: boolean;
    /** hydrate 후 API 호출 */
    enabled: boolean;
};

export function useCalendarEntries({
    viewMode,
    viewDate,
    includeTypes,
    excludeTypes,
    tagIds,
    scope,
    isLoggedIn,
    enabled,
}: UseCalendarEntriesArgs) {
    const [rangeEntries, setRangeEntries] = useState<CalendarEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [authRequired, setAuthRequired] = useState(false);
    const hasLoadedOnce = useRef(false);
    const inflight = useRef<AbortController | null>(null);

    /**
     * 요청 조건을 문자열 키로 고정한다. 필터 Set·태그 배열은 hydrate·태그 로딩 중 내용이 같아도
     * 참조가 바뀌므로, 참조 대신 실제 요청 내용이 바뀔 때만 다시 불러온다.
     */
    const requestKey = useMemo(() => {
        if (!enabled) return JSON.stringify({ kind: "disabled" });
        if (scope === "mine" && !isLoggedIn) return JSON.stringify({ kind: "auth" });
        const { from, to } = calendarRangeForView(viewMode, viewDate);
        const types = isLoggedIn ? typesForApiQuery(includeTypes, tagIds) : [];
        const params: FetchCalendarEntriesParams = { from, to, types, scope };
        return JSON.stringify({ kind: "fetch", params });
    }, [viewMode, viewDate, includeTypes, tagIds, scope, isLoggedIn, enabled]);

    const loadRangeEntries = useCallback(async () => {
        inflight.current?.abort();
        inflight.current = null;

        const request = JSON.parse(requestKey) as
            | { kind: "disabled" }
            | { kind: "auth" }
            | { kind: "fetch"; params: FetchCalendarEntriesParams };

        if (request.kind === "disabled") {
            setLoading(false);
            setAuthRequired(false);
            setRangeEntries([]);
            return;
        }

        if (request.kind === "auth") {
            setAuthRequired(true);
            setRangeEntries([]);
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        inflight.current = controller;

        if (!hasLoadedOnce.current) setLoading(true);
        setAuthRequired(false);

        try {
            const data = await fetchCalendarEntries(request.params, controller.signal);
            if (controller.signal.aborted) return;
            setRangeEntries(data);
            setError(null);
            hasLoadedOnce.current = true;
        } catch (err) {
            if (controller.signal.aborted || axios.isCancel(err)) return;
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                setAuthRequired(true);
                setRangeEntries([]);
                setError(null);
            } else {
                setError("일정을 불러오지 못했습니다.");
            }
        } finally {
            if (!controller.signal.aborted) {
                setLoading(false);
                inflight.current = null;
            }
        }
    }, [requestKey]);

    useEffect(() => {
        void loadRangeEntries();
    }, [loadRangeEntries]);

    useEffect(() => () => inflight.current?.abort(), []);

    const entries = useMemo(() => {
        if (!isLoggedIn) {
            return rangeEntries;
        }
        return rangeEntries.filter((e) =>
            entryPassesTagFilter(e, includeTypes, excludeTypes),
        );
    }, [rangeEntries, includeTypes, excludeTypes, isLoggedIn]);

    const addEntry = useCallback(
        async (input: CreateCalendarEntryRequest) => {
            const created = await createCalendarEntry(input);
            const { from, to } = calendarRangeForView(viewMode, viewDate);
            if (entryOverlapsRange(created, from, to)) {
                setRangeEntries((prev) => [...prev, created]);
            }
            return created;
        },
        [viewMode, viewDate],
    );

    const updateEntry = useCallback(
        async (entryId: string, input: UpdateCalendarEntryRequest) => {
            const updated = await updateCalendarEntry(entryId, input);
            setRangeEntries((prev) => prev.map((e) => (e.id === entryId ? updated : e)));
            return updated;
        },
        [],
    );

    const deleteEntry = useCallback(async (entryId: string) => {
        await deleteCalendarEntry(entryId);
        setRangeEntries((prev) => prev.filter((e) => e.id !== entryId));
    }, []);

    const refetch = useCallback(() => {
        void loadRangeEntries();
    }, [loadRangeEntries]);

    return {
        entries,
        loading,
        error,
        authRequired,
        addEntry,
        updateEntry,
        deleteEntry,
        refetch,
    };
}
