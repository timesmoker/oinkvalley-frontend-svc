import type { CalendarEntryType } from "@/features/calendar/types/calendar";
import type { CalendarTagDef } from "@/features/calendar/lib/tagRegistry";
import {
    allTagIds,
    getTagLabel,
    getTagStyle,
    PARTICIPATING_TAG_ID,
} from "@/features/calendar/lib/tagRegistry";
import { cn } from "@/lib/utils";

type EntryTagPillsProps = {
    allTags: CalendarTagDef[];
    tags: CalendarEntryType[];
    className?: string;
};

export default function EntryTagPills({ allTags, tags, className }: EntryTagPillsProps) {
    // 내 태그 목록에 없는 태그(구독 안 한 공개 태그 등)는 이름을 몰라 id 가 보이므로 칩을 그리지 않는다
    const known = new Set(allTagIds(allTags));
    const shown = tags.filter((t) => t === PARTICIPATING_TAG_ID || known.has(t));
    if (shown.length === 0) return null;

    const orderedTagIds = allTagIds(allTags);

    return (
        <span className={cn("flex flex-wrap gap-1", className)}>
            {shown.map((t) => {
                const style = getTagStyle(t, orderedTagIds);
                return (
                    <span
                        key={t}
                        className={cn(
                            "rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                            style.bg,
                            style.border,
                            style.text,
                        )}
                    >
                        {getTagLabel(t, allTags)}
                    </span>
                );
            })}
        </span>
    );
}
