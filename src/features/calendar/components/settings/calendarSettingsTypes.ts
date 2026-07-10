import type { CalendarTagDef } from "@/features/calendar/lib/tagRegistry";

export type SettingsTab = "mine" | "discover";
export type TagFilter = "all" | "public" | "private" | "hidden" | "followed";

export type TagStats = {
    total: number;
    publicCount: number;
    privateCount: number;
    hiddenCount: number;
};

export type TagActionHandlers = {
    canManage: (tag: CalendarTagDef) => boolean;
    canRemove: (tag: CalendarTagDef) => boolean;
    onDelete: (tag: CalendarTagDef) => void;
    onVisibilityChange: (tag: CalendarTagDef, visibility: "public" | "private") => void;
    onHiddenChange: (tag: CalendarTagDef, hidden: boolean) => void;
    onRename?: (tag: CalendarTagDef) => void;
};
