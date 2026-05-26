import type { CalendarEntryType } from "@/features/calendar/types/calendar";
import type { CalendarTagDef } from "@/features/calendar/tags/tagRegistry";
import { allTagIds, getTagLabel, getTagStyle } from "@/features/calendar/tags/tagRegistry";
import { cn } from "@/lib/utils";

type EntryTagPillsProps = {
    allTags: CalendarTagDef[];
    tags: CalendarEntryType[];
    className?: string;
};

export default function EntryTagPills({ allTags, tags, className }: EntryTagPillsProps) {
    if (tags.length === 0) return null;

    const orderedTagIds = allTagIds(allTags);

    return (
        <span className={cn("flex flex-wrap gap-1", className)}>
            {tags.map((t) => {
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
