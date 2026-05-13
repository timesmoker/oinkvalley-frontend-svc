"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import apiClient from "@/lib/api/apiClient";

export default function AuthInitializer() {
  const { login, logout, setHasHydrated } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const res = await apiClient.get<{ userId: number }>("/auth/me");
        if (cancelled) return;
        login(res.data.userId);
      } catch {
        if (cancelled) return;
        logout();
      } finally {
        if (!cancelled) setHasHydrated(true);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [login, logout, setHasHydrated]);

  return null;
}
