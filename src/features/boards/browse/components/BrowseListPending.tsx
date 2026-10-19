"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useHideAiStore } from "@/features/boards/browse/store/useHideAiStore";

/**
 * 전체 게시글 목록 영역 — "AI 글 숨기기" 값이 바뀌면 서버 렌더 목록을 다시 받는다 (페이지 새로고침 없음).
 * 받는 동안 기존 목록을 흐리게 두고 "불러오는 중" — 비웠다가 다시 그리지 않아 깜빡임이 없다.
 */
export default function BrowseListPending({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [refreshing, startTransition] = useTransition();
    const loaded = useHideAiStore((s) => s.loaded);
    const hideAi = useHideAiStore((s) => s.hideAi);
    const shown = useRef<boolean | null>(null);

    useEffect(() => {
        if (!loaded) return;
        // 첫 값(쿠키에서 읽은 값)은 서버가 이미 그 값으로 그렸으므로 다시 받지 않는다
        if (shown.current !== null && shown.current !== hideAi) {
            startTransition(() => router.refresh());
        }
        shown.current = hideAi;
    }, [loaded, hideAi, router]);

    return (
        <div className="relative" aria-busy={refreshing}>
            <div className={`transition-opacity duration-150 ${refreshing ? "pointer-events-none opacity-40" : ""}`}>
                {children}
            </div>
            {refreshing && (
                <div className="absolute inset-x-0 top-16 flex justify-center">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs text-gray-500 shadow-sm">불러오는 중…</span>
                </div>
            )}
        </div>
    );
}
