"use client";

import { Box, IconButton } from "@mui/material";
import { type ReactNode } from "react";
import { useBoardEditorSideToolbarHoverMenu } from "@/features/boards/components/boardEditorSideToolbarHoverMenu";

/**
 * 좌측 세로 툴바 — 호버 시 바로 오른쪽에 팝업.
 * - 트리거 위에 있는 동안 유지
 * - 다른 그룹 호버 시 즉시 전환
 * - 트리거·팝업 밖에 머물면 일정 시간 뒤 닫힘
 */
export default function BoardEditorMenuButtonGroup({
    icon,
    label,
    children,
}: {
    icon: ReactNode;
    label: string;
    children: ReactNode;
}) {
    const { openGroup, scheduleClose } = useBoardEditorSideToolbarHoverMenu();

    return (
        <Box
            className="board-editor-hover-group"
            onMouseEnter={(event) =>
                openGroup(label, event.currentTarget, children)
            }
            onMouseLeave={scheduleClose}
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
            }}
        >
            <IconButton
                aria-label={label}
                sx={{
                    width: 36,
                    height: 36,
                    "& .MuiSvgIcon-root": { fontSize: "1.25rem" },
                }}
            >
                {icon}
            </IconButton>
        </Box>
    );
}
