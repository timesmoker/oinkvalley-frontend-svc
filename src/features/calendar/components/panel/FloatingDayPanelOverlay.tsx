"use client";

import type { ReactNode } from "react";
import type { DayPanelSide } from "@/features/calendar/hooks/useFloatingDayPanel";
import { SIDE_RAIL } from "@/features/calendar/components/calendarLayout";
import { cn } from "@/lib/utils";

type FloatingDayPanelOverlayProps = {
    side: DayPanelSide;
    onClose: () => void;
    children: ReactNode;
};

/** xl 미만 화면: 일정 패널을 바텀시트(모바일)/사이드시트(sm+)로 띄우는 오버레이 */
export default function FloatingDayPanelOverlay({
    side,
    onClose,
    children,
}: FloatingDayPanelOverlayProps) {
    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex items-end bg-black/15",
                side === "left"
                    ? "sm:items-stretch sm:justify-start"
                    : "sm:items-stretch sm:justify-end",
            )}
            onPointerDown={onClose}
        >
            <div
                className="w-full sm:h-full sm:w-auto"
                onPointerDown={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}

/** 오버레이 안 DaySummaryPanel에 적용할 클래스 */
export function floatingDayPanelClass(side: DayPanelSide) {
    return cn(
        SIDE_RAIL,
        "h-[min(82dvh,40rem)] w-full rounded-t-2xl border-t border-border bg-background shadow-xl",
        "sm:h-full sm:w-[min(22rem,90vw)] sm:rounded-none sm:border-t-0",
        side === "left"
            ? "sm:border-r sm:border-border"
            : "sm:border-l sm:border-border",
    );
}
