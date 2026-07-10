/** 태그 id (기본: home | other + 사용자 추가) */
export type CalendarEntryType = string;

export type CalendarEntry = {
    id: string;
    title: string;
    tags: CalendarEntryType[];
    /** 일정 소유자 userId */
    ownerId: number;
    /** 참여자 userId 목록 (소유자 제외) */
    participantIds: number[];
    /** 생성 시 직접 입력한 참여자 이메일 목록 */
    participantEmails?: string[];
    startDate: string;
    endDate: string;
    allDay: boolean;
    startTime?: string;
    endTime?: string;
    note?: string;
    link?: string;
    /** event-svc `events.visibility` */
    visibility?: "PRIVATE" | "SHARED" | "PUBLIC";
};

export type CalendarEventScope = "visible" | "mine";

export type CalendarViewMode = "month" | "week" | "day";

export type CalendarEntryCreateDefaults = {
    allDay?: boolean;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    title?: string;
    tags?: CalendarEntryType[];
    previewKind?: "create" | "edit" | "selected";
};

/** 추가 폼 작성 중 뷰어 프리뷰용 초안 */
export type CalendarEntryDraftPreview = {
    title: string;
    tags: CalendarEntryType[];
    allDay?: boolean;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
};

/** 태그 추가 핸들러 — API 연동 시 Promise 반환 가능 */
export type CalendarAddTagFn = (label: string) => string | null | Promise<string | null>;

export type CalendarTagActionResult = boolean | Promise<boolean>;
