"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { CalendarAddTagFn } from "@/features/calendar/types/calendar";
import { cn } from "@/lib/utils";

type AddTagControlProps = {
    onAdd: CalendarAddTagFn;
    className?: string;
};

export default function AddTagControl({ onAdd, className }: AddTagControlProps) {
    const [open, setOpen] = useState(false);
    const [label, setLabel] = useState("");
    const [error, setError] = useState<string | null>(null);

    const submit = async () => {
        const id = await Promise.resolve(onAdd(label));
        if (!id) {
            setError("이미 있거나 비어 있는 이름입니다.");
            return;
        }
        setLabel("");
        setError(null);
        setOpen(false);
    };

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={cn(
                    "inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition hover:border-foreground/30 hover:bg-muted/50 hover:text-foreground sm:text-xs",
                    className,
                )}
            >
                <Plus className="h-3 w-3" />
                태그 추가
            </button>
        );
    }

    return (
        <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
            <input
                value={label}
                onChange={(e) => {
                    setLabel(e.target.value);
                    setError(null);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        submit();
                    }
                    if (e.key === "Escape") {
                        setOpen(false);
                        setLabel("");
                        setError(null);
                    }
                }}
                placeholder="태그 이름"
                maxLength={12}
                autoFocus
                className="w-24 rounded-md border border-border bg-background px-2 py-0.5 text-xs sm:w-28"
            />
            <button
                type="button"
                onClick={submit}
                className="rounded-md bg-gray-800 px-2 py-0.5 text-xs font-medium text-white"
            >
                추가
            </button>
            <button
                type="button"
                onClick={() => {
                    setOpen(false);
                    setLabel("");
                    setError(null);
                }}
                className="text-xs text-muted-foreground hover:underline"
            >
                취소
            </button>
            {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
    );
}
