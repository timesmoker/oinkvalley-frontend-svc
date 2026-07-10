import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import type { SelectProps, SxProps, Theme } from "@mui/material";
import type { HTMLAttributes } from "react";
import {
    boardEditorHeadingMenuPaperSx,
    boardEditorSideToolbarIconSelectInputSx,
    boardEditorSideToolbarTextSelectInputSx,
} from "@/features/boards/lib/boardEditorMenuSelectLabels";

/** 좌툴바 Select — 꽉 찬 오른쪽 삼각형 */
export function BoardEditorSideToolbarSelectArrowIcon({
    className,
}: HTMLAttributes<SVGSVGElement>) {
    return (
        <PlayArrowIcon
            className={className}
            sx={{
                fontSize: "0.625rem !important",
                color: "action.active",
                pointerEvents: "none",
            }}
        />
    );
}

/** 드롭다운 상단을 트리거 세로 중앙에 맞춰 오른쪽으로 열기 */
export const boardEditorSideToolbarSelectMenuProps: NonNullable<
    SelectProps["MenuProps"]
> = {
    anchorOrigin: { vertical: "center", horizontal: "right" },
    transformOrigin: { vertical: "top", horizontal: "left" },
    PaperProps: {
        sx: { ml: 0.375 },
    },
};

function flattenSx(part?: SxProps<Theme>): Record<string, unknown> {
    if (!part || typeof part !== "object" || Array.isArray(part)) return {};
    return part as Record<string, unknown>;
}

function mergeMenuSelectSx(
    ...parts: (SxProps<Theme> | undefined)[]
): SxProps<Theme> | undefined {
    const merged = parts.reduce<Record<string, unknown>>(
        (acc, part) => ({ ...acc, ...flattenSx(part) }),
        {},
    );
    return Object.keys(merged).length > 0 ? (merged as SxProps<Theme>) : undefined;
}

export function getBoardEditorMenuSelectProps(
    orientation: "horizontal" | "vertical",
    baseSx?: SxProps<Theme>,
    variant: "text" | "icon" = "text",
): Pick<SelectProps, "IconComponent" | "MenuProps" | "sx"> {
    if (orientation === "horizontal") {
        return { sx: baseSx };
    }

    const variantSx =
        variant === "icon"
            ? boardEditorSideToolbarIconSelectInputSx
            : boardEditorSideToolbarTextSelectInputSx;

    return {
        IconComponent: BoardEditorSideToolbarSelectArrowIcon,
        MenuProps: boardEditorSideToolbarSelectMenuProps,
        sx: mergeMenuSelectSx(baseSx, variantSx),
    };
}

/** 기존 MenuProps 와 좌툴 오프셋 병합 */
export function getBoardEditorHeadingSelectMenuProps(
    orientation: "horizontal" | "vertical",
): SelectProps["MenuProps"] {
    const paperSx = boardEditorHeadingMenuPaperSx(orientation);
    if (orientation === "horizontal") {
        return { PaperProps: { sx: paperSx } };
    }
    return mergeBoardEditorSideToolbarMenuProps(orientation, {
        PaperProps: { sx: paperSx },
    });
}

export function mergeBoardEditorSideToolbarMenuProps(
    orientation: "horizontal" | "vertical",
    menuProps?: SelectProps["MenuProps"],
): SelectProps["MenuProps"] | undefined {
    if (orientation === "horizontal") {
        return menuProps;
    }

    const sidePaperSx = boardEditorSideToolbarSelectMenuProps.PaperProps?.sx;
    const menuPaperSx = menuProps?.PaperProps?.sx;
    const mergedPaperSx = mergeMenuSelectSx(
        typeof menuPaperSx === "object" && !Array.isArray(menuPaperSx)
            ? menuPaperSx
            : undefined,
        typeof sidePaperSx === "object" && !Array.isArray(sidePaperSx)
            ? sidePaperSx
            : undefined,
    );

    return {
        ...menuProps,
        anchorOrigin: boardEditorSideToolbarSelectMenuProps.anchorOrigin,
        transformOrigin: boardEditorSideToolbarSelectMenuProps.transformOrigin,
        PaperProps: {
            ...menuProps?.PaperProps,
            ...(mergedPaperSx ? { sx: mergedPaperSx } : {}),
        },
    };
}
