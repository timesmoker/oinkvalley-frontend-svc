"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api/apiClient";
import type { CalendarEntry } from "@/features/calendar/types/calendar";
import type { ProfileResponse } from "@/features/profile/api/profileSvc";
import { profilesToNicknameRecord } from "@/features/profile/api/profileSvc";
import { collectEntryUserIds } from "@/features/calendar/lib/entryUtils";

/** 일정 소유자·참여자 userId → 닉네임 (프로필 API) */
export function useCalendarPeopleLabels(entries: CalendarEntry[]) {
    const [nicknameByUserId, setNicknameByUserId] = useState<Record<string, string>>({});

    const idsKey = entries
        .map((e) => `${e.ownerId}:${e.participantIds.join(".")}`)
        .join("|");

    useEffect(() => {
        const ids = collectEntryUserIds(entries);
        if (ids.length === 0) {
            setNicknameByUserId({});
            return;
        }

        let cancelled = false;

        void (async () => {
            try {
                const res = await apiClient.get<ProfileResponse[]>("/profiles", {
                    params: { ids: ids.join(",") },
                });
                const list = Array.isArray(res.data) ? res.data : [];
                if (!cancelled) {
                    setNicknameByUserId((prev) => ({
                        ...prev,
                        ...profilesToNicknameRecord(list),
                    }));
                }
            } catch {
                /* userId 폴백 */
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [idsKey]);

    return nicknameByUserId;
}
