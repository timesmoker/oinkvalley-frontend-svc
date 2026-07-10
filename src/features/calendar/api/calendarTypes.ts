import type { CalendarEntryType } from "@/features/calendar/types/calendar";

/** event-svc 이벤트 응답 DTO */
export type CalendarEntryResponse = {
    id: number | string;
    title: string;
    tags: CalendarEntryType[];
    ownerId?: number;
    participantIds?: number[];
    participantEmails?: string[];
    startDate: string;
    endDate: string;
    /** @deprecated 단일 date 응답 호환 */
    date?: string;
    allDay: boolean;
    startTime?: string | null;
    endTime?: string | null;
    note?: string | null;
    link?: string | null;
    visibility?: string | null;
};

export type UpdateCalendarEntryRequest = CreateCalendarEntryRequest;

export type CreateCalendarEntryRequest = {
    title: string;
    tags: CalendarEntryType[];
    /** 로그인 사용자 기준으로 서버가 소유자를 정할 수 있어 생략 가능 */
    ownerId?: number;
    participantEmails: string[];
    startDate: string;
    endDate: string;
    allDay: boolean;
    startTime?: string;
    endTime?: string;
    note?: string;
    link?: string;
    /** PRIVATE | SHARED | PUBLIC */
    visibility?: string;
};

export type FetchCalendarEntriesParams = {
    from: string;
    to: string;
    /** 선택된 태그 ID(문자열) — API query `tagIds` */
    types?: CalendarEntryType[];
    /** visible(기본) | mine — mine 은 로그인 필요 */
    scope?: "visible" | "mine";
};

/** event-svc 태그 */
export type TagResponse = {
    id: number;
    name: string;
    type: string;
    visibility: string;
    ownerId: number;
    hidden: boolean;
};

export type TagListResponse = {
    tags: TagResponse[];
    defaultVisibleTagIds: number[];
};

export type DiscoverTagResponse = {
    id: number;
    name: string;
    visibility: string;
    ownerId: number;
    ownerEmail: string;
    ownerNickname: string;
};
