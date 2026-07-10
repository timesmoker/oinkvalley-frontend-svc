"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CalendarEntryType } from "@/features/calendar/types/calendar";
import { useCalendarTags } from "@/features/calendar/hooks/useCalendarTags";
import {
    loadTagFilterSelection,
    saveTagFilterSelection,
} from "@/features/calendar/lib/calendarTagFilterStorage";

type UseCalendarTagFiltersArgs = {
    currentUserId?: number | null;
    enabled: boolean;
};

/**
 * 태그 목록 + 포함/제외 필터 상태.
 * 태그 추가·삭제·팔로우·숨김 시 필터 셋을 함께 갱신하고,
 * 사용자별 체크 상태를 localStorage에 저장/복원한다.
 */
export function useCalendarTagFilters({
    currentUserId,
    enabled,
}: UseCalendarTagFiltersArgs) {
    const tags = useCalendarTags({ currentUserId, enabled });
    const {
        tagIds,
        addTag,
        deleteTag,
        setTagHidden,
        followTag,
    } = tags;

    const [typeFilter, setTypeFilter] = useState<Set<CalendarEntryType>>(
        () => new Set(),
    );
    const [excludedTypeFilter, setExcludedTypeFilter] = useState<
        Set<CalendarEntryType>
    >(() => new Set());
    const initRef = useRef(false);

    useEffect(() => {
        if (!enabled) {
            initRef.current = false;
        }
    }, [enabled]);

    /** 태그 목록 로드 후: 저장된 체크 상태 복원 또는 전체 선택 */
    useEffect(() => {
        if (!enabled || tagIds.length === 0) return;

        if (!initRef.current) {
            initRef.current = true;
            let initialInclude: Set<CalendarEntryType>;
            let initialExclude = new Set<CalendarEntryType>();
            if (currentUserId != null) {
                const stored = loadTagFilterSelection(currentUserId);
                const validInclude =
                    stored?.include.filter((id) => tagIds.includes(id)) ?? [];
                const validExclude =
                    stored?.exclude.filter((id) => tagIds.includes(id)) ?? [];
                initialInclude =
                    validInclude.length > 0
                        ? new Set(validInclude)
                        : new Set(tagIds);
                initialExclude = new Set(
                    validExclude.filter((id) => !initialInclude.has(id)),
                );
            } else {
                initialInclude = new Set(tagIds);
            }
            setTypeFilter(initialInclude);
            setExcludedTypeFilter(initialExclude);
            return;
        }

        setTypeFilter((prev) => {
            const next = new Set([...prev].filter((id) => tagIds.includes(id)));
            return next.size === prev.size ? prev : next;
        });
        setExcludedTypeFilter((prev) => {
            const next = new Set(
                [...prev].filter(
                    (id) => tagIds.includes(id) && !typeFilter.has(id),
                ),
            );
            return next.size === prev.size ? prev : next;
        });
    }, [enabled, tagIds, currentUserId, typeFilter]);

    useEffect(() => {
        if (!enabled || currentUserId == null || !initRef.current) return;
        saveTagFilterSelection(currentUserId, {
            include: [...typeFilter],
            exclude: [...excludedTypeFilter],
        });
    }, [typeFilter, excludedTypeFilter, currentUserId, enabled]);

    const toggleTypeFilter = useCallback((type: CalendarEntryType) => {
        setTypeFilter((prev) => {
            const next = new Set(prev);
            if (next.has(type)) next.delete(type);
            else {
                next.add(type);
                setExcludedTypeFilter((excluded) => {
                    const nextExcluded = new Set(excluded);
                    nextExcluded.delete(type);
                    return nextExcluded;
                });
            }
            return next;
        });
    }, []);

    const toggleExcludedTypeFilter = useCallback((type: CalendarEntryType) => {
        setExcludedTypeFilter((prev) => {
            const next = new Set(prev);
            if (next.has(type)) next.delete(type);
            else {
                next.add(type);
                setTypeFilter((included) => {
                    const nextIncluded = new Set(included);
                    nextIncluded.delete(type);
                    return nextIncluded;
                });
            }
            return next;
        });
    }, []);

    const selectAllTypes = useCallback(() => {
        setTypeFilter(new Set(tagIds));
        setExcludedTypeFilter(new Set());
    }, [tagIds]);

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
                setExcludedTypeFilter((prev) => {
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
                setExcludedTypeFilter((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
            }
            return changed;
        },
        [setTagHidden],
    );

    return {
        ...tags,
        typeFilter,
        excludedTypeFilter,
        toggleTypeFilter,
        toggleExcludedTypeFilter,
        selectAllTypes,
        handleAddTag,
        handleDeleteTag,
        handleFollowTag,
        handleHiddenTag,
    };
}
