"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CALENDAR_DAY_KEY_ATTR } from "@/features/calendar/lib/entryUtils";

export type DayPanelSide = "left" | "right";

/** 선택/드래그 첫날 칸이 화면 왼쪽이면 패널 오른쪽, 반대면 왼쪽 */
function resolveDayPanelSide(dayKey: string): DayPanelSide {
    const el = document.querySelector(`[${CALENDAR_DAY_KEY_ATTR}="${dayKey}"]`);
    if (!(el instanceof HTMLElement)) return "right";
    const rect = el.getBoundingClientRect();
    const mid = rect.left + rect.width / 2;
    return mid < window.innerWidth / 2 ? "right" : "left";
}

/**
 * xl 미만 화면의 떠 있는 일정 패널 상태.
 *
 * 핵심: 드래그(포인터 눌림) 중에는 패널 열림을 pointerup 이후로 미룬다.
 * - 창이 드래그 도중 뜨는 문제 방지
 * - 각 뷰의 드래그 해제(자체 pointerup 정리)와 독립적으로 동작하므로
 *   패널이 떠도 드래그 상태가 안 풀리는(stuck) 회귀가 없다.
 */
export function useFloatingDayPanel() {
    /** xl 미만: 사이드 레일이 숨겨져 빈칸 터치/드래그로 바로 일정 추가 */
    const [compactCreate, setCompactCreate] = useState(
        () =>
            typeof window !== "undefined" &&
            !window.matchMedia("(min-width: 1280px)").matches,
    );
    const [dayPanelOpen, setDayPanelOpen] = useState(false);
    const [dayPanelSide, setDayPanelSide] = useState<DayPanelSide>("right");
    const [pendingAnchor, setPendingAnchor] = useState<string | null>(null);
    /** 현재 눌려 있는 포인터 수 — 드래그 제스처 중 패널 열림 지연 판단용 */
    const activePointerCountRef = useRef(0);

    useEffect(() => {
        const query = window.matchMedia("(min-width: 1280px)");
        const sync = () => {
            setCompactCreate(!query.matches);
            if (query.matches) setDayPanelOpen(false);
        };
        sync();
        query.addEventListener("change", sync);
        return () => query.removeEventListener("change", sync);
    }, []);

    useEffect(() => {
        const down = () => {
            activePointerCountRef.current += 1;
        };
        const up = () => {
            activePointerCountRef.current = Math.max(
                0,
                activePointerCountRef.current - 1,
            );
        };
        const resetAll = () => {
            activePointerCountRef.current = 0;
        };
        window.addEventListener("pointerdown", down, true);
        window.addEventListener("pointerup", up, true);
        window.addEventListener("pointercancel", up, true);
        window.addEventListener("blur", resetAll);
        return () => {
            window.removeEventListener("pointerdown", down, true);
            window.removeEventListener("pointerup", up, true);
            window.removeEventListener("pointercancel", up, true);
            window.removeEventListener("blur", resetAll);
        };
    }, []);

    const openPanel = useCallback((anchorDayKey?: string) => {
        if (window.matchMedia("(min-width: 1280px)").matches) return;
        if (anchorDayKey) {
            setDayPanelSide(resolveDayPanelSide(anchorDayKey));
        }
        setDayPanelOpen(true);
    }, []);

    /**
     * 드래그 중이면 pointerup 이후로 열림을 미루고,
     * 포인터가 이미 떨어진 상태(클릭 등)면 즉시 연다.
     */
    const requestPanel = useCallback(
        (anchorDayKey: string) => {
            if (compactCreate && activePointerCountRef.current > 0) {
                setPendingAnchor(anchorDayKey);
                return;
            }
            openPanel(anchorDayKey);
        },
        [compactCreate, openPanel],
    );

    /** 미뤄둔 열림 처리 — 모든 포인터가 떨어졌을 때만 연다 */
    useEffect(() => {
        if (!pendingAnchor) return;
        let openTimer: number | null = null;
        const openAfterGesture = () => {
            if (activePointerCountRef.current > 0) return;
            if (openTimer != null) return;
            // setTimeout(0): 같은 pointerup을 처리하는 드래그/리사이즈 해제
            // 리스너들이 전부 실행된 뒤에 연다. 디스패치 중에 상태를 바꾸면
            // 리렌더로 해당 리스너가 제거·재등록되어 이번 이벤트를 놓치고
            // 드래그/리사이즈 상태가 안 풀리는(stuck) 버그가 생긴다.
            openTimer = window.setTimeout(() => {
                openTimer = null;
                if (activePointerCountRef.current > 0) return;
                const anchor = pendingAnchor;
                setPendingAnchor(null);
                openPanel(anchor);
            }, 0);
        };
        // capture: stopPropagation 하는 요소 위에서 떼도 열림이 씹히지 않게
        window.addEventListener("pointerup", openAfterGesture, true);
        window.addEventListener("pointercancel", openAfterGesture, true);
        window.addEventListener("blur", openAfterGesture);
        return () => {
            if (openTimer != null) window.clearTimeout(openTimer);
            window.removeEventListener("pointerup", openAfterGesture, true);
            window.removeEventListener("pointercancel", openAfterGesture, true);
            window.removeEventListener("blur", openAfterGesture);
        };
    }, [openPanel, pendingAnchor]);

    const clearPendingAnchor = useCallback(() => setPendingAnchor(null), []);
    const closePanel = useCallback(() => setDayPanelOpen(false), []);

    return {
        compactCreate,
        dayPanelOpen,
        dayPanelSide,
        openPanel,
        requestPanel,
        closePanel,
        clearPendingAnchor,
    };
}
