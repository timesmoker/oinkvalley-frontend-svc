"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

export type BoardEditorToolbarContextValue = {
    toolbarElement: HTMLElement | null;
    setToolbarElement: (el: HTMLElement | null) => void;
};

const BoardEditorToolbarContext = createContext<BoardEditorToolbarContextValue | null>(null);

export function BoardEditorToolbarProvider({
    value,
    children,
}: {
    value: BoardEditorToolbarContextValue;
    children: ReactNode;
}) {
    return (
        <BoardEditorToolbarContext.Provider value={value}>
            {children}
        </BoardEditorToolbarContext.Provider>
    );
}

export function useBoardEditorToolbarContext(): BoardEditorToolbarContextValue {
    const ctx = useContext(BoardEditorToolbarContext);
    if (!ctx) {
        throw new Error("useBoardEditorToolbarContext must be used within BoardEditorToolbarProvider");
    }
    return ctx;
}

