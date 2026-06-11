"use client";

import FormatSize from "@mui/icons-material/FormatSize";
import { useTheme } from "@mui/material";
import {
    InputAdornment,
    ListSubheader,
    MenuItem,
    TextField,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import {
    MenuSelect,
    getAttributesForEachSelected,
    useRichTextEditorContext,
} from "mui-tiptap";
import {
    BOARD_EDITOR_FONT_SIZE_OPTIONS,
    boardEditorCompactFontSizeSelectInputSx,
    boardEditorFontSizeMenuPaperSx,
    normalizeBoardEditorFontSizeInput,
    stripPxFromFontSizeValue,
} from "@/features/boards/lib/boardEditorMenuSelectLabels";
import {
    getBoardEditorMenuSelectProps,
    mergeBoardEditorSideToolbarMenuProps,
} from "@/features/boards/lib/boardEditorSideToolbarSelect";

const MULTIPLE_SIZES_SELECTED_VALUE = "MULTIPLE";

export default function BoardMenuSelectFontSize({
    orientation = "horizontal",
}: {
    orientation?: "horizontal" | "vertical";
}) {
    const editor = useRichTextEditorContext();
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [customInput, setCustomInput] = useState("");

    let currentFontSize = "";
    if (editor) {
        const allCurrentTextStyleAttrs = getAttributesForEachSelected(
            editor.state,
            "textStyle",
        );
        const isTextStyleAppliedToEntireSelection = editor.isActive("textStyle");
        const currentFontSizes = allCurrentTextStyleAttrs.map(
            (attrs) => attrs.fontSize ?? "",
        );
        if (!isTextStyleAppliedToEntireSelection) {
            currentFontSizes.push("");
        }

        const numUnique = new Set(currentFontSizes).size;
        if (numUnique === 1) {
            currentFontSize = currentFontSizes[0];
        } else if (numUnique > 1) {
            currentFontSize = MULTIPLE_SIZES_SELECTED_VALUE;
        }
    }

    useEffect(() => {
        if (!open) return;
        if (
            currentFontSize &&
            currentFontSize !== MULTIPLE_SIZES_SELECTED_VALUE
        ) {
            setCustomInput(stripPxFromFontSizeValue(currentFontSize));
        } else {
            setCustomInput("");
        }
    }, [open, currentFontSize]);

    const applyCustomSize = useCallback(() => {
        const value = normalizeBoardEditorFontSizeInput(customInput);
        if (!value || !editor?.can().setFontSize(value)) return;
        editor.chain().setFontSize(value).focus().run();
        setOpen(false);
    }, [customInput, editor]);

    const handlePresetChange = useCallback(
        (value: string) => {
            if (!editor) return;
            if (value) {
                editor.chain().setFontSize(value).focus().run();
            } else {
                editor.chain().unsetFontSize().focus().run();
            }
            setOpen(false);
        },
        [editor],
    );

    const disabled =
        !editor?.isEditable || !editor.can().setFontSize("12px");

    const selectLayoutProps = getBoardEditorMenuSelectProps(
        orientation,
        orientation === "vertical"
            ? undefined
            : boardEditorCompactFontSizeSelectInputSx,
        orientation === "vertical" &&
            (!currentFontSize || currentFontSize === MULTIPLE_SIZES_SELECTED_VALUE)
            ? "icon"
            : "text",
    );

    return (
        <MenuSelect
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            disabled={disabled}
            value={currentFontSize || ""}
            onChange={(event) => handlePresetChange(String(event.target.value))}
            displayEmpty
            renderValue={(value) => {
                if (!value || value === MULTIPLE_SIZES_SELECTED_VALUE) {
                    return (
                        <FormatSize
                            sx={{
                                fontSize:
                                    orientation === "vertical"
                                        ? "1.25rem"
                                        : "1.25rem",
                                color:
                                    orientation === "vertical"
                                        ? theme.palette.action.active
                                        : undefined,
                            }}
                        />
                    );
                }
                return stripPxFromFontSizeValue(value);
            }}
            aria-label="Font sizes"
            tooltipTitle="Font size"
            {...selectLayoutProps}
            MenuProps={mergeBoardEditorSideToolbarMenuProps(orientation, {
                autoFocus: false,
                disableAutoFocusItem: true,
                PaperProps: {
                    sx: boardEditorFontSizeMenuPaperSx(orientation),
                },
            })}
        >
            <ListSubheader
                component="div"
                sx={{
                    lineHeight: 1,
                    px: 0.75,
                    py: 0.5,
                    bgcolor: "background.paper",
                }}
                onKeyDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
            >
                <TextField
                    size="small"
                    fullWidth
                    placeholder="16"
                    value={customInput}
                    disabled={disabled}
                    autoFocus
                    onChange={(event) => setCustomInput(event.target.value)}
                    onKeyDown={(event) => {
                        event.stopPropagation();
                        if (event.key === "Enter") {
                            event.preventDefault();
                            applyCustomSize();
                        }
                    }}
                    onClick={(event) => event.stopPropagation()}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment
                                    position="end"
                                    sx={{ "& p": { fontSize: "0.65rem" } }}
                                >
                                    px
                                </InputAdornment>
                            ),
                            sx: {
                                fontSize: "0.75rem",
                                py: 0.25,
                                height: 26,
                            },
                        },
                    }}
                />
            </ListSubheader>

            <MenuItem value="">Default</MenuItem>
            <MenuItem
                style={{ display: "none" }}
                value={MULTIPLE_SIZES_SELECTED_VALUE}
            />

            {BOARD_EDITOR_FONT_SIZE_OPTIONS.map((size) => (
                <MenuItem key={size} value={size}>
                    {stripPxFromFontSizeValue(size)}
                </MenuItem>
            ))}
        </MenuSelect>
    );
}
