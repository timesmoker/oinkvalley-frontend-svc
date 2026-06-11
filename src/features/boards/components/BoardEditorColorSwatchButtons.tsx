"use client";

import {
    Box,
    Button,
    ButtonBase,
    ClickAwayListener,
    IconButton,
    Paper,
    Popper,
    Tooltip,
} from "@mui/material";
import { useState, type ComponentType } from "react";
import type { SvgIconProps } from "@mui/material";
import {
    ColorPicker,
    ColorSwatchButton,
    useRichTextEditorContext,
} from "mui-tiptap";
import {
    BoardEditorHighlightColorIcon,
    BoardEditorTextColorIcon,
} from "@/features/boards/components/boardEditorColorIcons";

/** 후보색 9개 (3x3) */
const TEXT_SWATCH_COLORS = [
    { value: "#000000", label: "Black" },
    { value: "#888888", label: "Grey" },
    { value: "#ffffff", label: "White" },
    { value: "#ff0000", label: "Red" },
    { value: "#ff9900", label: "Orange" },
    { value: "#ffff00", label: "Yellow" },
    { value: "#00d000", label: "Green" },
    { value: "#0000ff", label: "Blue" },
    { value: "#9900ff", label: "Purple" },
];

/** 색상 분리 버튼 툴팁 — 오른쪽으로 밀어 색 상자 안 가리게 */
const colorSplitTooltipSlotProps = {
    popper: {
        popperOptions: {
            placement: "right" as const,
            modifiers: [
                { name: "offset", options: { offset: [0, 22] } },
            ],
        },
    },
};

const HIGHLIGHT_SWATCH_COLORS = [
    { value: "#595959", label: "Dark grey" },
    { value: "#dddddd", label: "Light grey" },
    { value: "#ffa6a6", label: "Light red" },
    { value: "#ffd699", label: "Light orange" },
    { value: "#ffff00", label: "Yellow" },
    { value: "#99cc99", label: "Light green" },
    { value: "#90c6ff", label: "Light blue" },
    { value: "#8085e9", label: "Light purple" },
    { value: "#ff99cc", label: "Pink" },
];

/**
 * 분리형 색 버튼 (Word 스타일):
 * - 아이콘 버튼 클릭 → 마지막 색을 선택 텍스트에 즉시 적용
 * - 색 상자 버튼 클릭 → 팝업 (후보색 9개 + 상세 색 설정)
 * - 후보색 클릭 즉시 적용·닫힘 (확인 버튼 없음)
 * - 상세 색 설정에서만 확인 버튼
 */
function BoardColorSplitButton({
    Icon,
    applyTooltip,
    pickTooltip,
    colors,
    defaultColor,
    disabled,
    onApply,
    tightSpacing = true,
}: {
    Icon: ComponentType<SvgIconProps>;
    applyTooltip: string;
    pickTooltip: string;
    colors: { value: string; label: string }[];
    defaultColor: string;
    disabled: boolean;
    onApply: (color: string) => void;
    /** false면 아이콘·색 상자 간격 넓게 (형광펜용) */
    tightSpacing?: boolean;
}) {
    const [lastColor, setLastColor] = useState(defaultColor);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [draftColor, setDraftColor] = useState(defaultColor);

    const close = () => {
        setAnchorEl(null);
        setDetailOpen(false);
    };

    const pick = (color: string) => {
        setLastColor(color);
        onApply(color);
        close();
    };

    const iconBtnSx = tightSpacing
        ? { width: 22, height: 36, mr: "-2px" }
        : { width: 24, height: 36 };
    const swatchBtnSx = tightSpacing
        ? { width: 14, height: 36 }
        : { width: 16, height: 36 };

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                gap: tightSpacing ? 0 : "1px",
            }}
        >
            <Tooltip
                title={applyTooltip}
                placement="right"
                slotProps={colorSplitTooltipSlotProps}
            >
                <span>
                    <IconButton
                        size="small"
                        disabled={disabled}
                        onClick={() => onApply(lastColor)}
                        sx={{
                            borderRadius: 1,
                            p: 0,
                            ...iconBtnSx,
                        }}
                    >
                        <Icon sx={{ fontSize: "1.25rem" }} />
                    </IconButton>
                </span>
            </Tooltip>

            <Tooltip
                title={pickTooltip}
                placement="right"
                slotProps={colorSplitTooltipSlotProps}
            >
                <span>
                    <ButtonBase
                        disabled={disabled}
                        onClick={(event) => {
                            if (anchorEl) {
                                close();
                            } else {
                                setDraftColor(lastColor);
                                setAnchorEl(event.currentTarget);
                            }
                        }}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "4px",
                            ...swatchBtnSx,
                        }}
                    >
                        <Box
                            component="span"
                            sx={{
                                display: "inline-block",
                                width: 12,
                                height: 12,
                                borderRadius: "3px",
                                border: "1px solid",
                                borderColor: "grey.400",
                                backgroundColor: lastColor,
                            }}
                        />
                    </ButtonBase>
                </span>
            </Tooltip>

            <Popper
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                placement="right-start"
                sx={{ zIndex: (theme) => theme.zIndex.tooltip }}
            >
                <ClickAwayListener onClickAway={close}>
                    <Paper elevation={4} sx={{ p: 1 }}>
                        {detailOpen ? (
                            <Box sx={{ width: 180 }}>
                                <ColorPicker
                                    value={draftColor}
                                    onChange={(color) => setDraftColor(color)}
                                />
                                <Button
                                    fullWidth
                                    size="small"
                                    variant="contained"
                                    sx={{ mt: 0.75 }}
                                    onClick={() => pick(draftColor)}
                                >
                                    확인
                                </Button>
                            </Box>
                        ) : (
                            <>
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(3, 1fr)",
                                        gap: 0.5,
                                    }}
                                >
                                    {colors.map((color) => (
                                        <ColorSwatchButton
                                            key={color.value}
                                            value={color.value}
                                            label={color.label}
                                            active={color.value === lastColor}
                                            onClick={() => pick(color.value)}
                                        />
                                    ))}
                                </Box>
                                <Button
                                    fullWidth
                                    size="small"
                                    sx={{
                                        mt: 0.75,
                                        fontSize: "0.7rem",
                                        minWidth: 0,
                                        whiteSpace: "nowrap",
                                    }}
                                    onClick={() => setDetailOpen(true)}
                                >
                                    상세 색 설정
                                </Button>
                            </>
                        )}
                    </Paper>
                </ClickAwayListener>
            </Popper>
        </Box>
    );
}

export function BoardMenuButtonTextColorSwatch() {
    const editor = useRichTextEditorContext();
    const disabled = !editor?.isEditable || !editor.can().setColor("#000");

    return (
        <BoardColorSplitButton
            Icon={BoardEditorTextColorIcon}
            applyTooltip="글자 색 적용"
            pickTooltip="글자 색 선택"
            colors={TEXT_SWATCH_COLORS}
            defaultColor="#000000"
            disabled={disabled}
            onApply={(color) => {
                editor?.chain().focus().setColor(color).run();
            }}
        />
    );
}

export function BoardMenuButtonHighlightColorSwatch() {
    const editor = useRichTextEditorContext();
    const disabled = !editor?.isEditable || !editor.can().toggleHighlight();

    return (
        <BoardColorSplitButton
            Icon={BoardEditorHighlightColorIcon}
            applyTooltip="형광펜 적용"
            pickTooltip="형광펜 색 선택"
            colors={HIGHLIGHT_SWATCH_COLORS}
            defaultColor="#ffff00"
            disabled={disabled}
            tightSpacing={false}
            onApply={(color) => {
                // 같은 색이 이미 칠해져 있으면 토글로 해제
                if (editor?.isActive("highlight", { color })) {
                    editor.chain().focus().unsetHighlight().run();
                } else {
                    editor
                        ?.chain()
                        .focus()
                        .setHighlight({ color })
                        .run();
                }
            }}
        />
    );
}
