"use client";

import { Box, IconButton } from "@mui/material";
import { type ReactNode } from "react";
import { useBoardEditorSideToolbarHoverMenu } from "@/features/boards/editor/components/boardEditorSideToolbarHoverMenu";

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
