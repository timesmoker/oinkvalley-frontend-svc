"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import apiClient from "@/lib/api/apiClient";
import type { MeResponse } from "@/features/auth/api/authTypes";

function consumeGuestParam(): boolean {
  if (typeof window === "undefined") return false;
  const url = new URL(window.location.href);
  if (url.searchParams.get("guest") !== "1") return false;
  url.searchParams.delete("guest");
  window.history.replaceState(null, "", url.toString());
  return true;
}

export default function AuthInitializer() {
  const { login, logout, setHasHydrated } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    const fetchMe = async (): Promise<boolean> => {
      try {
        const res = await apiClient.get<MeResponse>("/auth/me");
        if (cancelled) return true;
        login(res.data.userId);
        return true;
      } catch {
        return false;
      }
    };

    const run = async () => {
      const wantsGuest = consumeGuestParam();

      if (await fetchMe()) {
        if (!cancelled) setHasHydrated(true);
        return;
      }

      // 비로그인 + ?guest=1 → 게스트 로그인 시도. 실패는 조용히 무시(서버도 오류를 안 준다).
      if (wantsGuest && !cancelled) {
        try {
          const res = await apiClient.post("/auth/guest");
          if (!cancelled && res.status === 200 && (await fetchMe())) {
            if (!cancelled) setHasHydrated(true);
            return;
          }
        } catch {
          // 게스트 로그인 비활성 또는 실패 — 일반 비로그인 상태로 진행
        }
      }

      if (!cancelled) {
        logout();
        setHasHydrated(true);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [login, logout, setHasHydrated]);

  return null;
}
