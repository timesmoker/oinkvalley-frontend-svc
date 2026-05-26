"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import type { CalendarTagDef } from "@/features/calendar/tags/tagRegistry";
import { slugifyTagLabel } from "@/features/calendar/tags/tagRegistry";
import {
    createCalendarTag,
    deleteCalendarTag,
    fetchCalendarTags,
    followCalendarTag,
    setCalendarTagHidden,
    unfollowCalendarTag,
    updateCalendarTagName,
    updateCalendarTagVisibility,
} from "@/features/calendar/api/calendarApi";
import type { TagResponse } from "@/features/calendar/api/calendarTypes";

function mapTagResponse(tag: TagResponse, currentUserId?: number | null): CalendarTagDef {
    const isOwn = currentUserId != null && tag.ownerId === currentUserId;
    const isPublic = tag.visibility === "PUBLIC" || tag.visibility === "SHARED";
    const tagType = tag.type === "ETC" ? "ETC" : "USER";
    return {
        id: String(tag.id),
        label: tag.name,
        tagType,
        ownerId: tag.ownerId,
        ownerLabel: isOwn ? "나" : `사용자 #${tag.ownerId}`,
        visibility: isPublic ? "public" : "private",
        source: isOwn ? "own" : "followed",
        hidden: tag.hidden === true,
    };
}

type UseCalendarTagsArgs = {
    currentUserId?: number | null;
    enabled: boolean;
};

export function useCalendarTags({ currentUserId, enabled }: UseCalendarTagsArgs) {
    const [tags, setTags] = useState<CalendarTagDef[]>([]);
    const [defaultVisibleTagIds, setDefaultVisibleTagIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        if (!enabled) {
            setTags([]);
            setDefaultVisibleTagIds([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetchCalendarTags();
            const mapped = res.tags.map((t) => mapTagResponse(t, currentUserId));
            setTags(mapped);
            setDefaultVisibleTagIds(res.defaultVisibleTagIds);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                setTags([]);
                setDefaultVisibleTagIds([]);
            } else {
                setError("태그를 불러오지 못했습니다.");
            }
        } finally {
            setLoading(false);
        }
    }, [currentUserId, enabled]);

    useEffect(() => {
        void reload();
    }, [reload]);

    const allTags = tags;
    const visibleTags = useMemo(() => allTags.filter((tag) => !tag.hidden), [allTags]);
    const orderedTagIds = useMemo(() => allTags.map((t) => t.id), [allTags]);
    const tagIds = useMemo(() => visibleTags.map((t) => t.id), [visibleTags]);

    const defaultVisibleTagIdStrings = useMemo(
        () => defaultVisibleTagIds.map(String),
        [defaultVisibleTagIds],
    );

    const patchTagHiddenLocal = useCallback((id: string, hidden: boolean) => {
        setTags((prev) =>
            prev.map((tag) => (tag.id === id ? { ...tag, hidden } : tag)),
        );
    }, []);

    const addTag = useCallback(
        async (label: string): Promise<string | null> => {
            const trimmed = label.trim();
            if (!trimmed) return null;
            const existingIds = new Set(allTags.map((t) => t.id));
            if (allTags.some((tag) => tag.label === trimmed)) return null;

            try {
                const created = await createCalendarTag(trimmed, "private");
                const mapped = mapTagResponse(created, currentUserId);
                setTags((prev) => [...prev, mapped]);
                return mapped.id;
            } catch {
                slugifyTagLabel(trimmed, existingIds);
                return null;
            }
        },
        [allTags, currentUserId],
    );

    const setTagVisibility = useCallback(
        async (id: string, visibility: "public" | "private"): Promise<boolean> => {
            const target = tags.find((tag) => tag.id === id);
            if (!target) {
                return false;
            }
            if (target.ownerId != null && currentUserId != null && target.ownerId !== currentUserId) {
                return false;
            }
            setTags((prev) =>
                prev.map((tag) => (tag.id === id ? { ...tag, visibility } : tag)),
            );
            try {
                const updated = await updateCalendarTagVisibility(id, visibility);
                const mapped = mapTagResponse(updated, currentUserId);
                setTags((prev) => prev.map((tag) => (tag.id === id ? mapped : tag)));
                return true;
            } catch {
                setTags((prev) =>
                    prev.map((tag) =>
                        tag.id === id ? { ...tag, visibility: target.visibility } : tag,
                    ),
                );
                return false;
            }
        },
        [tags, currentUserId],
    );

    const setTagHidden = useCallback(
        async (id: string, hidden: boolean): Promise<boolean> => {
            const target = tags.find((tag) => tag.id === id);
            if (!target) return false;

            patchTagHiddenLocal(id, hidden);
            try {
                await setCalendarTagHidden(id, hidden);
                return true;
            } catch {
                patchTagHiddenLocal(id, !hidden);
                return false;
            }
        },
        [tags, patchTagHiddenLocal],
    );

    const renameTag = useCallback(
        async (id: string, name: string): Promise<boolean> => {
            const trimmed = name.trim();
            if (!trimmed) return false;
            try {
                const updated = await updateCalendarTagName(id, trimmed);
                const mapped = mapTagResponse(updated, currentUserId);
                setTags((prev) => prev.map((t) => (t.id === id ? mapped : t)));
                return true;
            } catch {
                return false;
            }
        },
        [currentUserId],
    );

    const deleteTag = useCallback(
        async (id: string): Promise<boolean> => {
            const target = tags.find((tag) => tag.id === id);
            if (!target) return false;
            if (target.source === "followed") {
                try {
                    await unfollowCalendarTag(id);
                    setTags((prev) => prev.filter((t) => t.id !== id));
                    return true;
                } catch {
                    return setTagHidden(id, true);
                }
            }
            if (target.tagType === "ETC") return false;
            if (target.ownerId != null && target.ownerId !== currentUserId) return false;
            try {
                await deleteCalendarTag(id);
                setTags((prev) => prev.filter((tag) => tag.id !== id));
                return true;
            } catch {
                return false;
            }
        },
        [tags, currentUserId, setTagHidden],
    );

    const followTag = useCallback(
        async (tag: CalendarTagDef): Promise<string | null> => {
            if (tag.visibility === "private") return null;
            try {
                const res = await followCalendarTag(tag.id);
                const mapped = mapTagResponse(res, currentUserId);
                const withSource = { ...mapped, source: "followed" as const, hidden: false };
                setTags((prev) => {
                    const exists = prev.some((t) => t.id === tag.id);
                    if (exists) {
                        return prev.map((t) => (t.id === tag.id ? withSource : t));
                    }
                    return [...prev, withSource];
                });
                return tag.id;
            } catch {
                return null;
            }
        },
        [currentUserId],
    );

    return {
        allTags,
        visibleTags,
        orderedTagIds,
        tagIds,
        defaultVisibleTagIdStrings,
        loading,
        error,
        addTag,
        deleteTag,
        renameTag,
        setTagVisibility,
        setTagHidden,
        followTag,
        reload,
    };
}
