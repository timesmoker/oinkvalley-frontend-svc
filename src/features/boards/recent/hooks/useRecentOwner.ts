"use client";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { recentOwnerOf } from "@/features/boards/recent/store/useRecentVisitsStore";

/** 로그인 확인이 끝난 뒤의 기록 주인 (끝나기 전엔 null — 비로그인으로 잘못 읽고 쓰지 않게) */
export function useRecentOwner(): number | null {
    const userId = useAuthStore((s) => s.userId);
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const hasHydrated = useAuthStore((s) => s.hasHydrated);
    return hasHydrated ? recentOwnerOf(isLoggedIn, userId) : null;
}
