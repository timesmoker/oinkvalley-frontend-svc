"use client";

import { X } from "lucide-react";
import type { SettingsTab, TagStats } from "@/features/calendar/components/settings/calendarSettingsTypes";
import { cn } from "@/lib/utils";

type CalendarSettingsHeaderProps = {
    tab: SettingsTab;
    stats: TagStats;
    onTabChange: (tab: SettingsTab) => void;
    onClose: () => void;
};

const TABS: { id: SettingsTab; label: string }[] = [
    { id: "mine", label: "내 태그" },
    { id: "discover", label: "태그 찾기" },
];

export default function CalendarSettingsHeader({
    tab,
    stats,
    onTabChange,
    onClose,
}: CalendarSettingsHeaderProps) {
    return (
        <header className="shrink-0 border-b border-border px-4 py-3">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="text-base font-semibold text-foreground">캘린더 설정</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">태그 관리</p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    aria-label="설정 닫기"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-1.5">
                <div className="rounded-md bg-muted/35 px-2 py-1.5">
                    <p className="text-[11px] text-muted-foreground">전체</p>
                    <p className="text-sm font-semibold text-foreground">{stats.total}</p>
                </div>
                <div className="rounded-md bg-muted/35 px-2 py-1.5">
                    <p className="text-[11px] text-muted-foreground">공개</p>
                    <p className="text-sm font-semibold text-foreground">{stats.publicCount}</p>
                </div>
                <div className="rounded-md bg-muted/35 px-2 py-1.5">
                    <p className="text-[11px] text-muted-foreground">비공개</p>
                    <p className="text-sm font-semibold text-foreground">{stats.privateCount}</p>
                </div>
                <div className="rounded-md bg-muted/35 px-2 py-1.5">
                    <p className="text-[11px] text-muted-foreground">숨김</p>
                    <p className="text-sm font-semibold text-foreground">{stats.hiddenCount}</p>
                </div>
            </div>

            <div className="mt-3 grid grid-cols-2 rounded-md border border-border p-0.5 text-sm">
                {TABS.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onTabChange(item.id)}
                        className={cn(
                            "rounded px-3 py-1 font-medium transition",
                            tab === item.id
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:bg-muted/50",
                        )}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </header>
    );
}
