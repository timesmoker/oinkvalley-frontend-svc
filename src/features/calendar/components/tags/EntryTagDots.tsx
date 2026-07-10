import type { CalendarEntryType } from "@/features/calendar/types/calendar";
import { getTagStyle } from "@/features/calendar/lib/tagRegistry";
import { cn } from "@/lib/utils";

type EntryTagDotsProps = {
    tags: CalendarEntryType[];
    orderedTagIds: readonly CalendarEntryType[];
    className?: string;
};

export default function EntryTagDots({ tags, orderedTagIds, className }: EntryTagDotsProps) {
    if (tags.length === 0) return null;

    return (
        <span className={cn("inline-flex shrink-0 items-center gap-0.5", className)}>
            {tags.map((t) => {
                const style = getTagStyle(t, orderedTagIds);
                return (
                    <span
                        key={t}
                        className={cn("h-1.5 w-1.5 rounded-full", style.dot)}
                        title={t}
                    />
                );
            })}
        </span>
    );
}
