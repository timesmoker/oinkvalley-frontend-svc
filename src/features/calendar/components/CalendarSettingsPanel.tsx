"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { discoverCalendarTagsByEmail } from "@/features/calendar/api/calendarApi";
import type { CalendarAddTagFn, CalendarTagActionResult } from "@/features/calendar/types/calendar";
import type { CalendarTagDef } from "@/features/calendar/lib/tagRegistry";
import { allTagIds } from "@/features/calendar/lib/tagRegistry";
import CalendarSettingsHeader from "@/features/calendar/components/settings/CalendarSettingsHeader";
import DiscoverTagsSettings from "@/features/calendar/components/settings/DiscoverTagsSettings";
import MyTagsSettings from "@/features/calendar/components/settings/MyTagsSettings";
import type {
    SettingsTab,
    TagFilter,
} from "@/features/calendar/components/settings/calendarSettingsTypes";
import {
    calculateTagStats,
    canManageTag,
    canRemoveTag,
    filterTags,
    mapDiscoverTagResponse,
} from "@/features/calendar/components/settings/calendarSettingsUtils";

type CalendarSettingsPanelProps = {
    open: boolean;
    tags: CalendarTagDef[];
    /** `CALENDAR_DEFAULT_VISIBLE_TAG_IDS` — 공통 태그는 휴지통 미표시 */
    defaultVisibleTagIds?: readonly string[];
    currentUserId?: number | null;
    onClose: () => void;
    onAddTag: CalendarAddTagFn;
    onDeleteTag: (id: string) => CalendarTagActionResult;
    onVisibilityChange: (id: string, visibility: "public" | "private") => CalendarTagActionResult;
    onHiddenChange: (id: string, hidden: boolean) => CalendarTagActionResult;
    onFollowTag: (tag: CalendarTagDef) => string | null | Promise<string | null>;
    onRenameTag?: (id: string, name: string) => CalendarTagActionResult;
};

export default function CalendarSettingsPanel({
    open,
    tags,
    defaultVisibleTagIds = [],
    currentUserId,
    onClose,
    onAddTag,
    onDeleteTag,
    onVisibilityChange,
    onHiddenChange,
    onFollowTag,
    onRenameTag,
}: CalendarSettingsPanelProps) {
    const [tab, setTab] = useState<SettingsTab>("mine");
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<TagFilter>("all");
    const [ownerEmailInput, setOwnerEmailInput] = useState("");
    const [discoverTags, setDiscoverTags] = useState<CalendarTagDef[]>([]);
    const [discoverLoading, setDiscoverLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const currentOwnerId = currentUserId ?? null;
    const defaultVisibleSet = useMemo(
        () => new Set(defaultVisibleTagIds),
        [defaultVisibleTagIds],
    );
    const orderedTagIds = useMemo(() => allTagIds(tags), [tags]);
    const addedTagIds = useMemo(() => new Set(tags.map((tag) => tag.id)), [tags]);
    const stats = useMemo(() => calculateTagStats(tags), [tags]);
    const filteredTags = useMemo(
        () => filterTags(tags, query, filter),
        [filter, query, tags],
    );
    useEffect(() => {
        const email = ownerEmailInput.trim();
        if (!email) {
            setDiscoverTags([]);
            setDiscoverLoading(false);
            return;
        }

        let cancelled = false;
        const timer = window.setTimeout(() => {
            setDiscoverLoading(true);
            void discoverCalendarTagsByEmail(email)
                .then((rows) => {
                    if (cancelled) return;
                    setDiscoverTags(rows.map(mapDiscoverTagResponse));
                })
                .catch((err) => {
                    if (cancelled) return;
                    setDiscoverTags([]);
                    if (!axios.isAxiosError(err) || err.response?.status !== 401) {
                        setMessage("태그 검색에 실패했습니다.");
                    }
                })
                .finally(() => {
                    if (!cancelled) setDiscoverLoading(false);
                });
        }, 300);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [ownerEmailInput]);

    if (!open) return null;

    const canManage = (tag: CalendarTagDef) => canManageTag(tag, currentOwnerId);
    const canRemove = (tag: CalendarTagDef) =>
        canRemoveTag(tag, currentOwnerId, defaultVisibleSet);

    const handleDelete = (tag: CalendarTagDef) => {
        if (tag.source !== "followed") {
            const confirmed = window.confirm(`'${tag.label}' 태그를 삭제할까요?`);
            if (!confirmed) return;
        }
        void Promise.resolve(onDeleteTag(tag.id)).then((ok) => {
        if (tag.source === "followed") {
            setMessage(ok ? "내 태그에서 제거했습니다." : "태그를 제거할 수 없습니다.");
            return;
        }
        setMessage(ok ? "태그를 삭제했습니다." : "태그를 삭제할 수 없습니다.");
        });
    };

    const handleVisibility = (tag: CalendarTagDef, visibility: "public" | "private") => {
        if (!canManage(tag)) {
            setMessage("공개 여부는 태그 소유자만 바꿀 수 있습니다.");
            return;
        }
        void Promise.resolve(onVisibilityChange(tag.id, visibility)).then((ok) => {
            setMessage(
                ok
                    ? visibility === "public"
                        ? "태그를 공개로 변경했습니다."
                        : "태그를 비공개로 변경했습니다."
                    : "태그 공개 여부를 변경할 수 없습니다.",
            );
        });
    };

    const handleHidden = (tag: CalendarTagDef, hidden: boolean) => {
        void Promise.resolve(onHiddenChange(tag.id, hidden)).then((ok) => {
            setMessage(
                ok
                    ? hidden
                        ? "왼쪽 태그 목록에서 숨겼습니다."
                        : "왼쪽 태그 목록에 다시 표시합니다."
                    : "태그 표시 상태를 바꿀 수 없습니다.",
            );
        });
    };

    const handleFollow = (tag: CalendarTagDef) => {
        void Promise.resolve(onFollowTag(tag)).then((id) => {
            setMessage(id ? "내 태그에 추가했습니다." : "비공개 태그는 추가할 수 없습니다.");
        });
    };

    const handleRename = (tag: CalendarTagDef) => {
        if (!onRenameTag || !canManage(tag)) return;
        const next = window.prompt("새 태그 이름", tag.label);
        if (next == null) return;
        void Promise.resolve(onRenameTag(tag.id, next)).then((ok) => {
            setMessage(ok ? "태그 이름을 변경했습니다." : "태그 이름을 변경할 수 없습니다.");
        });
    };

    const handleAddTag = async (label: string) => {
        const id = await Promise.resolve(onAddTag(label));
        setMessage(id ? "태그를 추가했습니다." : "태그를 추가할 수 없습니다.");
        return id;
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-end bg-black/20 p-3 sm:p-4"
            onPointerDown={onClose}
        >
            <aside
                className="flex h-full w-full max-w-lg flex-col rounded-lg border border-border bg-background shadow-xl"
                onPointerDown={(e) => e.stopPropagation()}
            >
                <CalendarSettingsHeader
                    tab={tab}
                    stats={stats}
                    onTabChange={setTab}
                    onClose={onClose}
                />

                <div className="min-h-0 flex-1 overflow-hidden">
                    {tab === "mine" ? (
                        <MyTagsSettings
                            query={query}
                            filter={filter}
                            tags={filteredTags}
                            orderedTagIds={orderedTagIds}
                            canManage={canManage}
                            canRemove={canRemove}
                            onAddTag={handleAddTag}
                            onDelete={handleDelete}
                            onVisibilityChange={handleVisibility}
                            onHiddenChange={handleHidden}
                            onRename={onRenameTag ? handleRename : undefined}
                            onQueryChange={setQuery}
                            onFilterChange={setFilter}
                        />
                    ) : (
                        <DiscoverTagsSettings
                            ownerEmailInput={ownerEmailInput}
                            ownerTags={discoverTags}
                            discoverLoading={discoverLoading}
                            addedTagIds={addedTagIds}
                            onOwnerEmailChange={setOwnerEmailInput}
                            onFollowTag={handleFollow}
                        />
                    )}
                </div>

                {message && (
                    <p className="shrink-0 border-t border-border px-4 py-3 text-sm text-muted-foreground">
                        {message}
                    </p>
                )}
            </aside>
        </div>
    );
}
