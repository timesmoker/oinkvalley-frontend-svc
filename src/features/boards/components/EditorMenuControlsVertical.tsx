import CodeIcon from "@mui/icons-material/Code";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import PostAddIcon from "@mui/icons-material/PostAdd";
import { useTheme } from "@mui/material";
import {
    BOARD_EDITOR_FONT_FAMILY_OPTIONS,
    BOARD_EDITOR_HEADING_LABELS,
} from "@/features/boards/lib/boardEditorMenuSelectLabels";
import {
    getBoardEditorHeadingSelectMenuProps,
    getBoardEditorMenuSelectProps,
} from "@/features/boards/lib/boardEditorSideToolbarSelect";
import {
    BoardMenuButtonHighlightColorSwatch,
    BoardMenuButtonTextColorSwatch,
} from "@/features/boards/components/BoardEditorColorSwatchButtons";
import BoardEditorMenuButtonGroup from "@/features/boards/components/BoardEditorMenuButtonGroup";
import { BoardEditorSideToolbarHoverMenuProvider } from "@/features/boards/components/boardEditorSideToolbarHoverMenu";
import BoardEditorSideToolbarUndoRedo from "@/features/boards/components/BoardEditorSideToolbarUndoRedo";
import BoardMenuButtonEditLink from "@/features/boards/components/BoardMenuButtonEditLink";
import BoardMenuSelectFontSize from "@/features/boards/components/BoardMenuSelectFontSize";
import MenuButtonDetails from "@/features/boards/components/MenuButtonDetails";
import MenuButtonInsertImage from "@/features/boards/components/MenuButtonInsertImage";
import {
    MenuButtonAddTable,
    MenuButtonBlockquote,
    MenuButtonBold,
    MenuButtonBulletedList,
    MenuButtonCode,
    MenuButtonCodeBlock,
    MenuButtonHorizontalRule,
    MenuButtonItalic,
    MenuButtonOrderedList,
    MenuButtonRemoveFormatting,
    MenuButtonStrikethrough,
    MenuButtonTaskList,
    MenuButtonUnderline,
    MenuControlsContainer,
    MenuDivider,
    MenuSelectFontFamily,
    MenuSelectHeading,
    MenuSelectTextAlign,
} from "mui-tiptap";

const sideToolbarIconSx = { fontSize: "1.25rem" } as const;

export default function EditorMenuControlsVertical({
    scope = "post",
}: {
    scope?: "post" | "comment";
}) {
    const theme = useTheme();
    const isComment = scope === "comment";

    return (
        <BoardEditorSideToolbarHoverMenuProvider>
        <MenuControlsContainer>
            <MenuSelectFontFamily
                options={[...BOARD_EDITOR_FONT_FAMILY_OPTIONS]}
                emptyLabel="Font"
                {...getBoardEditorMenuSelectProps("vertical")}
            />

            <MenuDivider />

            <MenuSelectHeading
                labels={BOARD_EDITOR_HEADING_LABELS}
                {...getBoardEditorMenuSelectProps("vertical")}
                MenuProps={getBoardEditorHeadingSelectMenuProps("vertical")}
            />

            <MenuDivider />

            <BoardMenuSelectFontSize orientation="vertical" />

            <MenuDivider />

            <BoardEditorMenuButtonGroup
                icon={<FormatBoldIcon sx={sideToolbarIconSx} />}
                label="글자 스타일"
            >
                <MenuButtonBold />
                <MenuButtonItalic />
                <MenuButtonUnderline />
                <MenuButtonStrikethrough />
            </BoardEditorMenuButtonGroup>

            <BoardMenuButtonTextColorSwatch />

            <BoardMenuButtonHighlightColorSwatch />

            {!isComment && <BoardMenuButtonEditLink />}

            <MenuButtonInsertImage />

            <MenuDivider />

            <MenuSelectTextAlign
                emptyLabel={
                    <FormatAlignLeftIcon
                        sx={{
                            ...sideToolbarIconSx,
                            color: theme.palette.action.active,
                        }}
                    />
                }
                {...getBoardEditorMenuSelectProps("vertical", undefined, "icon")}
            />

            <BoardEditorMenuButtonGroup
                icon={<FormatListBulletedIcon sx={sideToolbarIconSx} />}
                label="목록"
            >
                <MenuButtonOrderedList />
                <MenuButtonBulletedList />
                <MenuButtonTaskList />
            </BoardEditorMenuButtonGroup>

            {!isComment && (
                <BoardEditorMenuButtonGroup
                    icon={<PostAddIcon sx={sideToolbarIconSx} />}
                    label="블록 삽입"
                >
                    <MenuButtonBlockquote />
                    <MenuButtonDetails />
                    <MenuButtonHorizontalRule />
                    <MenuButtonAddTable />
                </BoardEditorMenuButtonGroup>
            )}

            {isComment && <MenuButtonBlockquote />}

            <BoardEditorMenuButtonGroup
                icon={<CodeIcon sx={sideToolbarIconSx} />}
                label="코드"
            >
                <MenuButtonCode />
                <MenuButtonCodeBlock />
            </BoardEditorMenuButtonGroup>

            <MenuDivider />

            <MenuButtonRemoveFormatting />

            {!isComment && <BoardEditorSideToolbarUndoRedo />}
        </MenuControlsContainer>
        </BoardEditorSideToolbarHoverMenuProvider>
    );
}
