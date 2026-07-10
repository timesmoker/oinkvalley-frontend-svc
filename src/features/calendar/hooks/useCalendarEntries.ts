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

    const loadRangeEntries = useCallback(async () => {
        if (!enabled) {
            setLoading(false);
            setAuthRequired(false);
            setRangeEntries([]);
            return;
        }

        if (scope === "mine" && !isLoggedIn) {
            setAuthRequired(true);
            setRangeEntries([]);
            setLoading(false);
            return;
        }

        const { from, to } = calendarRangeForView(viewMode, viewDate);
        const types = isLoggedIn ? typesForApiQuery(includeTypes, tagIds) : [];

        if (!hasLoadedOnce.current) setLoading(true);
        setAuthRequired(false);

        try {
            const data = await fetchCalendarEntries({ from, to, types, scope });
            setRangeEntries(data);
            setError(null);
            hasLoadedOnce.current = true;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                setAuthRequired(true);
                setRangeEntries([]);
                setError(null);
            } else {
                setError("일정을 불러오지 못했습니다.");
            }
        } finally {
            setLoading(false);
        }
    }, [viewMode, viewDate, includeTypes, tagIds, scope, isLoggedIn, enabled]);

    useEffect(() => {
        void loadRangeEntries();
    }, [loadRangeEntries]);

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
