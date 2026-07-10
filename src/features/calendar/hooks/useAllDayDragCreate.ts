"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { calendarDayKeyFromPoint } from "@/features/calendar/lib/entryUtils";

export type AllDayDragRange = { start: string; end: string };

type UseAllDayDragCreateArgs = {
    /** onCreateEntry 유무 등 — false면 드래그 시작 안 함 */
    enabled: boolean;
    /** 프리뷰 리사이즈/이동 중이면 true — 드래그 시작 차단 */
    blocked?: boolean;
    /** 시작 가능 칸 제한 (선택일에서만 등). 없으면 모든 칸 허용 */
    canStartFrom?: (dayKey: string) => boolean;
    /** 드래그 중 실시간 범위 통지 (시작 칸과 다른 칸에 들어갔을 때만) */
    onLiveRange?: (dragStartKey: string, enteredKey: string) => void;
    /** 드래그 종료 커밋 — 정렬된 시작/종료일 전달 */
    onCommit: (startDate: string, endDate: string, dragStartKey: string) => void;
    /** 칸 밖에서 드래그 종료 */
    onCancel?: () => void;
};

/**
 * 종일 범위 드래그 생성 공통 로직 (월 그리드·주 종일 행 공용).
 * pointerdown 시작 → pointerenter 확장 → window pointerup에서 커밋/취소.
 * 같은 칸에서 떼면 커밋하지 않고 click 핸들러에 맡긴다.
 */
export function useAllDayDragCreate({
    enabled,
    blocked = false,
    canStartFrom,
    onLiveRange,
    onCommit,
    onCancel,
}: UseAllDayDragCreateArgs) {
    const dragStartKeyRef = useRef<string | null>(null);
    /** 드래그로 끝난 칸의 잔여 click 무시용 */
    const suppressClickDayKeyRef = useRef<string | null>(null);
    const [dragRange, setDragRange] = useState<AllDayDragRange | null>(null);

    const startDrag = (dayKey: string) => {
        if (!enabled || blocked) return;
        if (canStartFrom && !canStartFrom(dayKey)) return;
        dragStartKeyRef.current = dayKey;
        setDragRange({ start: dayKey, end: dayKey });
    };

    const enterDrag = (dayKey: string) => {
        if (!dragStartKeyRef.current) return;
        setDragRange({ start: dragStartKeyRef.current, end: dayKey });
        if (dayKey !== dragStartKeyRef.current) {
            onLiveRange?.(dragStartKeyRef.current, dayKey);
        }
    };

    const cancelDrag = useCallback(() => {
        if (!dragStartKeyRef.current) return;
        dragStartKeyRef.current = null;
        setDragRange(null);
        onCancel?.();
    }, [onCancel]);

    const endDrag = useCallback(
        (dayKey: string) => {
            const start = dragStartKeyRef.current;
            if (!start) return;
            dragStartKeyRef.current = null;
            setDragRange(null);
            if (start === dayKey) return;
            suppressClickDayKeyRef.current = dayKey;
            const startDate = start < dayKey ? start : dayKey;
            const endDate = start < dayKey ? dayKey : start;
            onCommit(startDate, endDate, start);
        },
        [onCommit],
    );

    useEffect(() => {
        if (!dragRange) return;

        const finish = (event: globalThis.PointerEvent) => {
            if (!dragStartKeyRef.current) return;
            const key = calendarDayKeyFromPoint(event.clientX, event.clientY);
            if (key) endDrag(key);
            else cancelDrag();
        };

        window.addEventListener("pointerup", finish, true);
        window.addEventListener("pointercancel", finish, true);
        return () => {
            window.removeEventListener("pointerup", finish, true);
            window.removeEventListener("pointercancel", finish, true);
        };
    }, [dragRange, cancelDrag, endDrag]);

    /** 드래그 종료 칸의 잔여 click이면 true(소모). 다른 날 클릭은 통과 */
    const consumeSuppressedClick = (dayKey: string) => {
        if (suppressClickDayKeyRef.current == null) return false;
        const suppressed = suppressClickDayKeyRef.current;
        suppressClickDayKeyRef.current = null;
        return suppressed === dayKey;
    };

    return {
        dragRange,
        isDragging: dragRange != null,
        startDrag,
        enterDrag,
        consumeSuppressedClick,
    };
}
