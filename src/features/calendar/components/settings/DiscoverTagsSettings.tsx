"use client";

import { Plus, Search, Tag } from "lucide-react";
import type { CalendarTagDef } from "@/features/calendar/tags/tagRegistry";

type DiscoverTagsSettingsProps = {
    ownerEmailInput: string;
    ownerTags: CalendarTagDef[];
    discoverLoading?: boolean;
    addedTagIds: ReadonlySet<string>;
    onOwnerEmailChange: (value: string) => void;
    onFollowTag: (tag: CalendarTagDef) => void;
};

export default function DiscoverTagsSettings({
    ownerEmailInput,
    ownerTags,
    discoverLoading = false,
    addedTagIds,
    onOwnerEmailChange,
    onFollowTag,
}: DiscoverTagsSettingsProps) {
    return (
        <section className="flex h-full min-h-0 flex-col px-4 py-4">
            <label className="block space-y-1 text-xs">
                <span className="text-muted-foreground">이메일</span>
                <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5 focus-within:border-foreground/40 focus-within:ring-1 focus-within:ring-foreground/20">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                        value={ownerEmailInput}
                        onChange={(e) => onOwnerEmailChange(e.target.value)}
                        placeholder="예: timesmoker3526@gmail.com"
                        inputMode="email"
                        className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                    />
                </div>
            </label>

            <ul className="mt-3 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
                {!ownerEmailInput.trim() && (
                    <li className="rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                        이메일로 공개 태그를 찾을 수 있습니다.
                    </li>
                )}
                {ownerEmailInput.trim() && discoverLoading && (
                    <li className="rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                        검색 중…
                    </li>
                )}
                {ownerEmailInput.trim() && !discoverLoading && ownerTags.length === 0 && (
                    <li className="rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                        해당 이메일 사용자가 없거나, 공개·공유 태그가 없습니다.
                        <span className="mt-1 block text-[11px]">
                            UI에서 「공개」로 만든 태그는 서버에 SHARED로 저장됩니다.
                        </span>
                    </li>
                )}
                {ownerTags.map((tag) => {
                    const added = addedTagIds.has(tag.id);
                    return (
                        <li
                            key={tag.id}
                            className="flex items-center justify-between gap-3 rounded-md border border-border px-2.5 py-2"
                        >
                            <div className="flex min-w-0 items-center gap-2">
                                <Tag className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                <div className="min-w-0">
                                    <p className="truncate text-[13px] font-medium">
                                        {tag.label}
                                    </p>
                                    <p className="truncate text-[11px] text-muted-foreground">
                                        {tag.ownerLabel ?? "닉네임 없음"}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={added}
                                onClick={() => onFollowTag(tag)}
                                className="flex shrink-0 items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[11px] font-medium hover:bg-muted/60 disabled:opacity-45"
                            >
                                <Plus className="h-3 w-3" />
                                {added ? "추가됨" : "내 태그"}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
