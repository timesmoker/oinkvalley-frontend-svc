"use client";

import { X } from "lucide-react";
import {
    hasInvalidParticipantEmail,
    parseParticipantEmailsInput,
} from "@/features/calendar/lib/entryUtils";
import { cn } from "@/lib/utils";

type ParticipantEmailInputProps = {
    emails: string[];
    draft: string;
    onEmailsChange: (emails: string[]) => void;
    onDraftChange: (value: string) => void;
};

export default function ParticipantEmailInput({
    emails,
    draft,
    onEmailsChange,
    onDraftChange,
}: ParticipantEmailInputProps) {
    const commitDraft = (raw = draft) => {
        const parsed = parseParticipantEmailsInput(raw);
        if (parsed.length === 0) {
            onDraftChange("");
            return;
        }

        const seen = new Set(emails);
        const next = [...emails];
        for (const email of parsed) {
            if (seen.has(email)) continue;
            seen.add(email);
            next.push(email);
        }
        onEmailsChange(next);
        onDraftChange("");
    };

    const removeEmail = (email: string) => {
        onEmailsChange(emails.filter((item) => item !== email));
    };

    return (
        <label className="block space-y-1 text-xs">
            <span className="text-muted-foreground">참여자 (선택)</span>
            <div className="flex min-h-[2.5rem] w-full flex-wrap items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus-within:border-foreground/40 focus-within:ring-1 focus-within:ring-foreground/20">
                {emails.map((email) => {
                    const invalid = hasInvalidParticipantEmail([email]);
                    return (
                        <span
                            key={email}
                            className={cn(
                                "inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-xs",
                                invalid
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-muted text-foreground",
                            )}
                        >
                            <span className="truncate">{email}</span>
                            <button
                                type="button"
                                onClick={() => removeEmail(email)}
                                className="rounded-full p-0.5 opacity-70 hover:bg-background/70 hover:opacity-100"
                                aria-label={`${email} 제거`}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    );
                })}
                <input
                    type="text"
                    inputMode="email"
                    value={draft}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (/[,，\s]/.test(value)) commitDraft(value);
                        else onDraftChange(value);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === "," || e.key === " ") {
                            e.preventDefault();
                            commitDraft();
                        }
                        if (e.key === "Backspace" && !draft && emails.length > 0) {
                            removeEmail(emails[emails.length - 1]!);
                        }
                    }}
                    onBlur={() => {
                        if (draft.trim()) commitDraft();
                    }}
                    placeholder={emails.length === 0 ? "예: timesmoker3526@gmail.com" : ""}
                    className="min-w-[10rem] flex-1 bg-transparent text-sm outline-none"
                />
            </div>
        </label>
    );
}
