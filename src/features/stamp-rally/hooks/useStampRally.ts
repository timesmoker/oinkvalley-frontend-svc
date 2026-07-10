"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  checkInToday,
  fetchMyRally,
} from "@/features/stamp-rally/api/stampRallyApi";
import type {
  ApiErrorBody,
  RallyViewResponse,
} from "@/features/stamp-rally/api/stampRallyTypes";

function exerciseDaysFromCheckIns(
  checkIns: string[],
  year: number,
  monthIndex: number,
): Set<number> {
  const days = new Set<number>();
  for (const iso of checkIns) {
    const parts = iso.split("-").map(Number);
    if (parts.length !== 3) continue;
    const [y, m, day] = parts;
    if (y === year && m === monthIndex + 1) {
      days.add(day);
    }
  }
  return days;
}

function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiErrorBody | undefined;
    if (typeof data?.message === "string" && data.message) {
      return data.message;
    }
  }
  return fallback;
}

export function useStampRally(initialRally?: RallyViewResponse) {
  const [rally, setRally] = useState<RallyViewResponse | null>(
    initialRally ?? null,
  );
  const [loading, setLoading] = useState(initialRally === undefined);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyRally();
      setRally(data);
    } catch {
      setError("스탬프랠리 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialRally !== undefined) return;
    void reload();
  }, [reload, initialRally]);

  const now = useMemo(() => new Date(), []);
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const filled = useMemo(
    () => new Set(rally?.filledSlots ?? []),
    [rally?.filledSlots],
  );

  const exerciseDays = useMemo(
    () =>
      exerciseDaysFromCheckIns(rally?.checkInsThisMonth ?? [], year, month),
    [rally?.checkInsThisMonth, year, month],
  );

  const handleCheckIn = useCallback(async () => {
    if (rally?.completedToday || checkingIn) return;

    setCheckingIn(true);
    setError(null);
    try {
      const data = await checkInToday();
      setRally(data);
    } catch (err) {
      setError(apiErrorMessage(err, "체크인에 실패했습니다."));
    } finally {
      setCheckingIn(false);
    }
  }, [rally, checkingIn]);

  return {
    rally,
    loading,
    checkingIn,
    error,
    filled,
    exerciseDays,
    year,
    month,
    today,
    handleCheckIn,
  };
}
