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

    /**
     * mui-tiptap MenuButtonTooltip은 placement="top"을 명시하지만,
     * popperOptions.placement가 BasePopper에서 나중에 spread되어 이를 덮는다.
     * 좌툴바 안 툴팁만 오른쪽으로 — 위 아이콘을 가리지 않게.
     */
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

    /** 트리거 아이콘·팝업·팝업이 띄운 보조 팝업(색상 픽커 등) 위에 있으면 유지 */
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

    /** 좌툴바의 다른(비그룹) 컨트롤에 호버되면 즉시 닫기 — 그룹끼리는 openGroup이 전환 */
    useEffect(() => {
        if (!menuState) return;
        const { anchorEl } = menuState;
        const toolbar = anchorEl.parentElement;
        if (!toolbar) return;

        const handleMouseOver = (event: MouseEvent) => {
            const target = event.target as Element | null;
            if (!target || !toolbar.contains(target)) return;
            if (anchorEl.contains(target)) return;
            // 다른 그룹은 자기 mouseenter에서 openGroup으로 전환 — 여기선 무시
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
            {/* Menu(Modal) 대신 Popper — backdrop이 없어 트리거의 :hover를 뺏지 않음 */}
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
