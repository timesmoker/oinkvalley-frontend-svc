"use client";

import type { ComponentProps, ReactNode } from "react";
import EntryTypeFilter from "@/features/calendar/components/tags/EntryTypeFilter";
import { SIDE_RAIL } from "@/features/calendar/components/calendarLayout";
import { cn } from "@/lib/utils";

type MobileTagFilterSheetProps = {
    onClose: () => void;
    /** 로딩/에러/안내 메시지 영역 */
    status?: ReactNode;
} & Pick<
    ComponentProps<typeof EntryTypeFilter>,
    | "allTags"
    | "included"
    | "excluded"
    | "onToggleInclude"
    | "onToggleExclude"
    | "onSelectAll"
    | "onAddTag"
>;

/** xl 미만 화면: 태그 필터를 바텀시트(모바일)/사이드시트(sm+)로 띄움 */
export default function MobileTagFilterSheet({
    onClose,
    status,
    ...filterProps
}: MobileTagFilterSheetProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-end bg-black/25 sm:items-stretch sm:justify-start xl:hidden"
            onPointerDown={onClose}
        >
            <aside
                className={cn(
                    SIDE_RAIL,
                    "h-[min(78dvh,34rem)] w-full rounded-t-2xl border-t border-border bg-background shadow-xl",
                    "sm:h-full sm:w-[min(20rem,86vw)] sm:rounded-none sm:border-r sm:border-t-0",
                )}
                onPointerDown={(e) => e.stopPropagation()}
            >
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                    <EntryTypeFilter layout="sidebar" {...filterProps} />
                </div>
                <div className="shrink-0 space-y-2 pt-3">{status}</div>
            </aside>
        </div>
    );
}
