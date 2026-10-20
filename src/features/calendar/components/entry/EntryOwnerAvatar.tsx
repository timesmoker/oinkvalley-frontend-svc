"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import UserAvatar from "@/components/ui/UserAvatar";
import type { CalendarEntry } from "@/features/calendar/types/calendar";
import { authorLabel } from "@/features/profile/api/profileSvc";
import { cn } from "@/lib/utils";

type EntryOwners = {
    currentUserId: number | null;
    nicknameByUserId: Record<string, string>;
};

const EntryOwnersContext = createContext<EntryOwners>({ currentUserId: null, nicknameByUserId: {} });

/** 달력 본문 일정 블록에 남의 일정 소유자를 표시하기 위한 닉네임 (뷰마다 props 로 내리지 않음) */
export function EntryOwnersProvider({
    currentUserId,
    nicknameByUserId,
    children,
}: EntryOwners & { children: ReactNode }) {
    const value = useMemo(
        () => ({ currentUserId, nicknameByUserId }),
        [currentUserId, nicknameByUserId],
    );
    return <EntryOwnersContext.Provider value={value}>{children}</EntryOwnersContext.Provider>;
}

/** 남이 만든 일정이면 소유자 아바타(동그라미)만. 내 일정·비로그인은 표시하지 않음 */
export default function EntryOwnerAvatar({
    entry,
    className,
}: {
    entry: Pick<CalendarEntry, "ownerId">;
    className?: string;
}) {
    const { currentUserId, nicknameByUserId } = useContext(EntryOwnersContext);
    if (currentUserId == null || entry.ownerId === currentUserId) return null;
    const name = authorLabel(nicknameByUserId, entry.ownerId);
    return <UserAvatar name={name} className={cn("h-3.5 w-3.5 text-[8px]", className)} />;
}
