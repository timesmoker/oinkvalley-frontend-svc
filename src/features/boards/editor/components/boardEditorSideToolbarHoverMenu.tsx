"use client";

import { Box, Paper, Popper } from "@mui/material";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";

/** 마우스가 트리거·팝업 밖에 머문 뒤 닫히기까지의 시간 */
const HOVER_CLOSE_MS = 1250;
const HOVER_MENU_CLASS = "board-editor-hover-menu-paper";

type HoverMenuState = {
    groupId: string;
    anchorEl: HTMLElement;
    content: ReactNode;
} | null;

type HoverMenuContextValue = {
    openGroup: (
        groupId: string,
        anchorEl: HTMLElement,
        content: ReactNode,
    ) => void;
    scheduleClose: () => void;
    clearCloseTimer: () => void;
};

const BoardEditorSideToolbarHoverMenuContext =
    createContext<HoverMenuContextValue | null>(null);

export function BoardEditorSideToolbarHoverMenuProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [menuState, setMenuState] = useState<HoverMenuState>(null);
    const menuStateRef = useRef<HoverMenuState>(null);
    menuStateRef.current = menuState;

    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const paperRef = useRef<HTMLDivElement>(null);
    const outerTheme = useTheme();

    const tooltipRightTheme = useMemo(
        () =>
            createTheme(outerTheme, {
                components: {
                    MuiTooltip: {
                        defaultProps: {
                            slotProps: {
                                popper: {
                                    popperOptions: {
                                        placement: "right" as const,
                                    },
                                },
                            },
                        },
                    },
                },
            }),
        [outerTheme],
    );

    const clearCloseTimer = useCallback(() => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    }, []);

    useEffect(() => clearCloseTimer, [clearCloseTimer]);

    const openGroup = useCallback(
        (groupId: string, anchorEl: HTMLElement, content: ReactNode) => {
            clearCloseTimer();
            setMenuState({ groupId, anchorEl, content });
        },
        [clearCloseTimer],
    );

    const shouldStayOpen = useCallback(() => {
        const anchor = menuStateRef.current?.anchorEl ?? null;
        if (anchor?.matches(":hover")) return true;

        const paper = paperRef.current;
        if (paper?.matches(":hover")) return true;
        if (
            paper &&
            document.activeElement &&
            paper.contains(document.activeElement)
        ) {
            return true;
        }

        if (
            document.querySelector(
                ".MuiPopper-root:hover, .MuiPopover-root:hover",
            )
        ) {
            return true;
        }
        return false;
    }, []);

    useEffect(() => {
        if (!menuState) return;
        const { anchorEl } = menuState;
        const toolbar = anchorEl.parentElement;
        if (!toolbar) return;

        const handleMouseOver = (event: MouseEvent) => {
            const target = event.target as Element | null;
            if (!target || !toolbar.contains(target)) return;
            if (anchorEl.contains(target)) return;
            if (target.closest(".board-editor-hover-group")) return;

            const control = target.closest("button, .MuiInputBase-root");
            if (control && toolbar.contains(control)) {
                clearCloseTimer();
                setMenuState(null);
            }
        };

        document.addEventListener("mouseover", handleMouseOver, true);
        return () =>
            document.removeEventListener("mouseover", handleMouseOver, true);
    }, [menuState, clearCloseTimer]);

    const scheduleClose = useCallback(() => {
        clearCloseTimer();
        const tick = () => {
            if (shouldStayOpen()) {
                closeTimerRef.current = setTimeout(tick, HOVER_CLOSE_MS);
            } else {
                closeTimerRef.current = null;
                setMenuState(null);
            }
        };
        closeTimerRef.current = setTimeout(tick, HOVER_CLOSE_MS);
    }, [clearCloseTimer, shouldStayOpen]);

    const popperModifiers = useMemo(
        () => [
            {
                name: "offset",
                options: {
                    offset: ({ reference }: { reference: { height: number } }) => [
                        reference.height / 2,
                        6,
                    ],
                },
            },
        ],
        [],
    );

    return (
        <BoardEditorSideToolbarHoverMenuContext.Provider
            value={{ openGroup, scheduleClose, clearCloseTimer }}
        >
            <ThemeProvider theme={tooltipRightTheme}>{children}</ThemeProvider>
            <Popper
                open={Boolean(menuState)}
                anchorEl={menuState?.anchorEl ?? null}
                placement="right-start"
                modifiers={popperModifiers}
                sx={{ zIndex: (theme) => theme.zIndex.tooltip }}
            >
                <Paper
                    ref={paperRef}
                    className={HOVER_MENU_CLASS}
                    elevation={4}
                    onMouseEnter={clearCloseTimer}
                    onMouseLeave={scheduleClose}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.25,
                            p: 0.75,
                            maxWidth: 220,
                        }}
                    >
                        {menuState?.content}
                    </Box>
                </Paper>
            </Popper>
        </BoardEditorSideToolbarHoverMenuContext.Provider>
    );
}

export function useBoardEditorSideToolbarHoverMenu() {
    const ctx = useContext(BoardEditorSideToolbarHoverMenuContext);
    if (!ctx) {
        throw new Error(
            "useBoardEditorSideToolbarHoverMenu must be used within BoardEditorSideToolbarHoverMenuProvider",
        );
    }
    return ctx;
}
