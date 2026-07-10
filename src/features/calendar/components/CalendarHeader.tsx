"use client";

import { ChevronLeft, ChevronRight, Settings, Tags } from "lucide-react";
import type {
    CalendarEventScope,
    CalendarViewMode,
} from "@/features/calendar/types/calendar";
import { cn } from "@/lib/utils";

const VIEW_TABS: { id: CalendarViewMode; label: string }[] = [
    { id: "month", label: "월" },
    { id: "week", label: "주" },
    { id: "day", label: "일" },
];

type CalendarHeaderProps = {
    title: string;
    viewMode: CalendarViewMode;
    eventScope: CalendarEventScope;
    isLoggedIn: boolean;
    onGoToday: () => void;
    onGoPrev: () => void;
    onGoNext: () => void;
    onEventScopeChange: (scope: CalendarEventScope) => void;
    onViewModeChange: (mode: CalendarViewMode) => void;
    onOpenTagPanel: () => void;
    onOpenSettings: () => void;
};

/** 상단 툴바: 오늘/범위/이동/제목/뷰 탭/태그·설정 버튼 */
export default function CalendarHeader({
    title,
    viewMode,
    eventScope,
    isLoggedIn,
    onGoToday,
    onGoPrev,
    onGoNext,
    onEventScopeChange,
    onViewModeChange,
    onOpenTagPanel,
    onOpenSettings,
}: CalendarHeaderProps) {
    return (
        <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-3 py-2 sm:gap-3 sm:px-4">
            <button
                type="button"
                onClick={onGoToday}
                className="rounded border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted/50"
            >
                오늘
            </button>

            <div className="flex rounded-md border border-border p-0.5 text-xs">
                <button
                    type="button"
                    disabled={!isLoggedIn}
                    onClick={() => onEventScopeChange("visible")}
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
                    onClick={() => onEventScopeChange("mine")}
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
                    onClick={onGoPrev}
                    className="rounded-full p-2 hover:bg-muted/60"
                    aria-label="이전"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={onGoNext}
                    className="rounded-full p-2 hover:bg-muted/60"
                    aria-label="다음"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            <h1 className="min-w-0 flex-1 truncate text-lg font-normal sm:text-xl">
                {title}
            </h1>

            <div className="flex rounded-md border border-border p-0.5 text-sm">
                {VIEW_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onViewModeChange(tab.id)}
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
                onClick={onOpenTagPanel}
                className="rounded-md p-2 text-muted-foreground transition hover:bg-muted/60 hover:text-foreground xl:hidden"
                aria-label="태그 필터"
            >
                <Tags className="h-5 w-5" />
            </button>

            <button
                type="button"
                onClick={onOpenSettings}
                className="rounded-md p-2 text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
                aria-label="캘린더 설정"
            >
                <Settings className="h-5 w-5" />
            </button>
        </header>
    );
}
