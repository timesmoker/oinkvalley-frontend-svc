"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import MiniMonthPicker from "@/features/calendar/components/entry/MiniMonthPicker";
import { formatDateKeyLong } from "@/features/calendar/lib/entryUtils";
import { cn } from "@/lib/utils";

type DatePickerFieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    minDate?: string;
    mutedDate?: string;
};

const inputClass =
    "w-full rounded-md border border-border bg-background text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20";

export default function DatePickerField({
    label,
    value,
    onChange,
    minDate,
    mutedDate,
}: DatePickerFieldProps) {
    const fieldId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);
    const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);

    const openPicker = () => {
        const rect = buttonRef.current?.getBoundingClientRect();
        if (!rect) return;
        const width = 272;
        const left = Math.min(rect.left, window.innerWidth - width - 8);
        setAnchor({ top: rect.bottom + 6, left: Math.max(8, left) });
        setOpen(true);
    };

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (rootRef.current?.contains(target)) return;
            setOpen(false);
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };

        window.addEventListener("pointerdown", onPointerDown, true);
        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("pointerdown", onPointerDown, true);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    const handleSelect = (next: string) => {
        onChange(next);
        setOpen(false);
    };

    return (
        <div ref={rootRef} className="relative space-y-1 text-xs">
            <span id={fieldId} className="text-muted-foreground">
                {label}
            </span>
            <button
                ref={buttonRef}
                type="button"
                aria-labelledby={fieldId}
                aria-expanded={open}
                aria-haspopup="dialog"
                onClick={() => (open ? setOpen(false) : openPicker())}
                className={cn(
                    inputClass,
                    "flex items-center justify-between gap-2 px-3 py-2 text-left",
                )}
            >
                <span>{formatDateKeyLong(value)}</span>
                <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>

            {open && anchor && (
                <div
                    className="fixed z-[120]"
                    style={{ top: anchor.top, left: anchor.left }}
                    role="dialog"
                    aria-label={`${label} 선택`}
                >
                    <MiniMonthPicker
                        value={value}
                        minDate={minDate}
                        mutedDate={mutedDate}
                        onChange={handleSelect}
                    />
                </div>
            )}
        </div>
    );
}
