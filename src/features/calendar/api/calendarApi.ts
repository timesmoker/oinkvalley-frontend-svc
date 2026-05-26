/**
 * event-svc 연동 — Ingress `/events`, `/tags`.
 */
import apiClient from "@/lib/api/apiClient";
import type { CalendarEntry } from "@/features/calendar/types/calendar";
import type {
    CalendarEntryResponse,
    CreateCalendarEntryRequest,
    DiscoverTagResponse,
    FetchCalendarEntriesParams,
    TagListResponse,
    TagResponse,
    UpdateCalendarEntryRequest,
} from "@/features/calendar/api/calendarTypes";
import { normalizeEntryTags, normalizeParticipantIds } from "@/features/calendar/lib/entryUtils";

function mapVisibility(raw?: string | null): CalendarEntry["visibility"] {
    if (raw === "PUBLIC" || raw === "SHARED" || raw === "PRIVATE") {
        return raw;
    }
    return "PRIVATE";
}

function mapEntry(dto: CalendarEntryResponse): CalendarEntry {
    const tags =
        dto.tags?.length > 0
            ? normalizeEntryTags(dto.tags.map(String))
            : [];
    const startDate = dto.startDate ?? dto.date ?? "";
    const endDate = dto.endDate ?? dto.date ?? startDate;

    const ownerId = dto.ownerId && dto.ownerId > 0 ? dto.ownerId : 0;
    const participantIds = normalizeParticipantIds(dto.participantIds ?? [], ownerId);

    return {
        id: String(dto.id),
        title: dto.title,
        tags,
        ownerId,
        participantIds,
        participantEmails: dto.participantEmails ?? [],
        startDate,
        endDate,
        allDay: dto.allDay,
        startTime: dto.startTime ?? undefined,
        endTime: dto.endTime ?? undefined,
        note: dto.note ?? undefined,
        link: dto.link ?? undefined,
        visibility: mapVisibility(dto.visibility),
    };
}

function entryPayload(input: CreateCalendarEntryRequest) {
    return {
        title: input.title,
        tags: normalizeEntryTags(input.tags),
        participantEmails: input.participantEmails ?? [],
        startDate: input.startDate,
        endDate: input.endDate,
        allDay: input.allDay,
        startTime: input.startTime,
        endTime: input.endTime,
        note: input.note,
        link: input.link,
        visibility: input.visibility ?? "PRIVATE",
    };
}

export async function fetchCalendarEntries(
    params: FetchCalendarEntriesParams,
): Promise<CalendarEntry[]> {
    const query: Record<string, string> = {
        from: params.from,
        to: params.to,
        scope: params.scope ?? "visible",
    };
    if (params.types && params.types.length > 0) {
        query.tagIds = params.types.join(",");
    }

    const res = await apiClient.get<CalendarEntryResponse[]>("/events", {
        params: query,
    });
    const data = Array.isArray(res.data) ? res.data : [];
    const byId = new Map<string, CalendarEntry>();
    for (const dto of data) {
        const entry = mapEntry(dto);
        byId.set(entry.id, entry);
    }
    return [...byId.values()];
}

export async function createCalendarEntry(
    input: CreateCalendarEntryRequest,
): Promise<CalendarEntry> {
    const res = await apiClient.post<CalendarEntryResponse>("/events", entryPayload(input));
    return mapEntry(res.data);
}

export async function updateCalendarEntry(
    entryId: string,
    input: UpdateCalendarEntryRequest,
): Promise<CalendarEntry> {
    const res = await apiClient.put<CalendarEntryResponse>(
        `/events/${encodeURIComponent(entryId)}`,
        entryPayload(input),
    );
    return mapEntry(res.data);
}

export async function deleteCalendarEntry(entryId: string): Promise<void> {
    await apiClient.delete(`/events/${encodeURIComponent(entryId)}`);
}

export async function discoverCalendarTagsByEmail(email: string): Promise<DiscoverTagResponse[]> {
    const trimmed = email.trim();
    if (!trimmed) return [];
    const res = await apiClient.get<DiscoverTagResponse[]>("/tags/discover", {
        params: { email: trimmed },
    });
    return Array.isArray(res.data) ? res.data : [];
}

export async function fetchCalendarTags(): Promise<TagListResponse> {
    const res = await apiClient.get<TagListResponse>("/tags");
    const data = res.data;
    return {
        tags: Array.isArray(data?.tags) ? data.tags : [],
        defaultVisibleTagIds: Array.isArray(data?.defaultVisibleTagIds)
            ? data.defaultVisibleTagIds
            : [],
    };
}

export async function createCalendarTag(name: string, visibility: "public" | "private"): Promise<TagResponse> {
    const res = await apiClient.post<TagResponse>("/tags", {
        name,
        visibility: visibility === "public" ? "PUBLIC" : "PRIVATE",
    });
    return res.data;
}

export async function updateCalendarTagName(tagId: string, name: string): Promise<TagResponse> {
    const res = await apiClient.put<TagResponse>(`/tags/${encodeURIComponent(tagId)}`, { name });
    return res.data;
}

export async function updateCalendarTagVisibility(
    tagId: string,
    visibility: "public" | "private",
): Promise<TagResponse> {
    const res = await apiClient.put<TagResponse>(
        `/tags/${encodeURIComponent(tagId)}/visibility`,
        { visibility: visibility === "public" ? "PUBLIC" : "PRIVATE" },
    );
    return res.data;
}

export async function followCalendarTag(tagId: string): Promise<TagResponse> {
    const res = await apiClient.post<TagResponse>(`/tags/${encodeURIComponent(tagId)}/follow`);
    return res.data;
}

export async function unfollowCalendarTag(tagId: string): Promise<void> {
    await apiClient.delete(`/tags/${encodeURIComponent(tagId)}/follow`);
}

export async function addCalendarTagMember(tagId: string, email: string): Promise<TagResponse> {
    const res = await apiClient.post<TagResponse>(
        `/tags/${encodeURIComponent(tagId)}/members`,
        { email: email.trim() },
    );
    return res.data;
}

export async function setCalendarTagHidden(tagId: string, hidden: boolean): Promise<void> {
    await apiClient.put(`/tags/${encodeURIComponent(tagId)}/hidden`, null, {
        params: { hidden },
    });
}

export async function replaceHiddenCalendarTags(tagIds: string[]): Promise<void> {
    await apiClient.put("/tags/hidden", {
        tagIds: tagIds.map((id) => Number(id)).filter((n) => Number.isFinite(n) && n > 0),
    });
}

export async function deleteCalendarTag(tagId: string): Promise<void> {
    await apiClient.delete(`/tags/${encodeURIComponent(tagId)}`);
}
