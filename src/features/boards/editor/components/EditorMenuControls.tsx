import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import { Box, useTheme } from "@mui/material";
import {
    BOARD_EDITOR_FONT_FAMILY_OPTIONS,
    BOARD_EDITOR_HEADING_LABELS,
    boardEditorCompactHeadingSelectInputSx,
    boardEditorCompactSelectInputSx,
} from "@/features/boards/lib/boardEditorMenuSelectLabels";
import { boardEditorCompactMenuBarAlignSelectSx } from "@/features/boards/lib/boardEditorMenuSelectLabels";
import { getBoardEditorHeadingSelectMenuProps } from "@/features/boards/lib/boardEditorSideToolbarSelect";
import { boardEditorVerticalMenuControlsSx } from "@/features/boards/lib/boardEditorToolbarLayout";
import {
    BoardEditorHighlightColorIcon,
    BoardEditorTextColorIcon,
} from "@/features/boards/editor/components/boardEditorColorIcons";
import EditorMenuControlsVertical from "@/features/boards/editor/components/EditorMenuControlsVertical";
import BoardMenuSelectFontSize from "@/features/boards/editor/components/BoardMenuSelectFontSize";
import MenuButtonDetails from "@/features/boards/editor/components/MenuButtonDetails";
import MenuButtonInsertImage from "@/features/boards/editor/components/MenuButtonInsertImage";
import {
    MenuButtonAddTable,
    MenuButtonBlockquote,
    MenuButtonBold,
    MenuButtonBulletedList,
    MenuButtonCode,
    MenuButtonCodeBlock,
    MenuButtonEditLink,
    MenuButtonHighlightColor,
    MenuButtonHorizontalRule,
    MenuButtonIndent,
    MenuButtonItalic,
    MenuButtonOrderedList,
    MenuButtonRedo,
    MenuButtonRemoveFormatting,
    MenuButtonStrikethrough,
    MenuButtonTaskList,
    MenuButtonTextColor,
    MenuButtonUnderline,
    MenuButtonUndo,
    MenuButtonUnindent,
    MenuControlsContainer,
    MenuDivider,
    MenuSelectFontFamily,
    MenuSelectHeading,
    MenuSelectTextAlign,
    isTouchDevice,
} from "mui-tiptap";

export default function EditorMenuControls({
    scope = "post",
    orientation = "horizontal",
}: {
    scope?: "post" | "comment";
    orientation?: "horizontal" | "vertical";
}) {
    const theme = useTheme();
    const isComment = scope === "comment";
    const isVertical = orientation === "vertical";

    if (isVertical) {
        return (
            <Box sx={boardEditorVerticalMenuControlsSx}>
                <EditorMenuControlsVertical scope={scope} />
            </Box>
        );
    }

    const controls = (
        <MenuControlsContainer>
            <MenuSelectFontFamily
                options={[...BOARD_EDITOR_FONT_FAMILY_OPTIONS]}
                emptyLabel="Font"
                sx={boardEditorCompactSelectInputSx}
            />

            <MenuDivider />

            <MenuSelectHeading
                labels={BOARD_EDITOR_HEADING_LABELS}
                sx={boardEditorCompactHeadingSelectInputSx}
                MenuProps={getBoardEditorHeadingSelectMenuProps("horizontal")}
            />

            <MenuDivider />

            <BoardMenuSelectFontSize orientation="horizontal" />

            <MenuDivider />

            <MenuButtonBold />
            <MenuButtonItalic />
            <MenuButtonUnderline />
            <MenuButtonStrikethrough />

            <MenuDivider />

            <MenuButtonTextColor
                IconComponent={BoardEditorTextColorIcon}
                defaultTextColor={theme.palette.text.primary}
                swatchColors={[
                    { value: "#000000", label: "Black" },
                    { value: "#ffffff", label: "White" },
                    { value: "#888888", label: "Grey" },
                    { value: "#ff0000", label: "Red" },
                    { value: "#ff9900", label: "Orange" },
                    { value: "#ffff00", label: "Yellow" },
                    { value: "#00d000", label: "Green" },
                    { value: "#0000ff", label: "Blue" },
                ]}
            />

            <MenuButtonHighlightColor
                IconComponent={BoardEditorHighlightColorIcon}
                swatchColors={[
                    { value: "#595959", label: "Dark grey" },
                    { value: "#dddddd", label: "Light grey" },
                    { value: "#ffa6a6", label: "Light red" },
                    { value: "#ffd699", label: "Light orange" },
                    { value: "#ffff00", label: "Yellow" },
                    { value: "#99cc99", label: "Light green" },
                    { value: "#90c6ff", label: "Light blue" },
                    { value: "#8085e9", label: "Light purple" },
                ]}
            />

            <MenuDivider />

            {!isComment && <MenuButtonEditLink />}
            <MenuButtonInsertImage />

            <MenuDivider />

            <MenuSelectTextAlign
                emptyLabel={
                    <FormatAlignLeftIcon
                        sx={{ fontSize: "1.25rem", color: theme.palette.action.active }}
                    />
                }
                sx={boardEditorCompactMenuBarAlignSelectSx}
            />

            <MenuDivider />

            <MenuButtonOrderedList />
            <MenuButtonBulletedList />
            <MenuButtonTaskList />

            {isTouchDevice() && (
                <>
                    <MenuButtonIndent />
                    <MenuButtonUnindent />
                </>
            )}

            <MenuDivider />

            <MenuButtonBlockquote />
            {!isComment && <MenuButtonDetails />}
            {!isComment && <MenuDivider />}
            <MenuButtonCode />
            <MenuButtonCodeBlock />
            {!isComment && <MenuDivider />}
            {!isComment && <MenuButtonHorizontalRule />}
            {!isComment && <MenuButtonAddTable />}
            {!isComment && <MenuDivider />}
            <MenuButtonRemoveFormatting />

            {!isComment && (
                <>
                    <MenuDivider />
                    <MenuButtonUndo />
                    <MenuButtonRedo />
                </>
            )}
        </MenuControlsContainer>
    );

    return controls;
}
