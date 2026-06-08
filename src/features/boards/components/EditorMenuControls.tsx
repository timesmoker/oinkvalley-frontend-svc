import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import { useTheme } from "@mui/material";
import MenuButtonDetails from "@/features/boards/components/MenuButtonDetails";
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
    MenuButtonSubscript,
    MenuButtonSuperscript,
    MenuButtonTaskList,
    MenuButtonTextColor,
    MenuButtonUnderline,
    MenuButtonUndo,
    MenuButtonUnindent,
    MenuControlsContainer,
    MenuDivider,
    MenuSelectFontFamily,
    MenuSelectFontSize,
    MenuSelectHeading,
    MenuSelectTextAlign,
    isTouchDevice,
} from "mui-tiptap";

export default function EditorMenuControls({ scope = "post" }: { scope?: "post" | "comment" }) {
    const theme = useTheme();
    const isComment = scope === "comment";
    return (
        <MenuControlsContainer>
            <MenuSelectFontFamily
                options={[
                    { label: "Comic Sans", value: "Comic Sans MS, Comic Sans" },
                    { label: "Cursive", value: "cursive" },
                    { label: "Monospace", value: "monospace" },
                    { label: "Serif", value: "serif" },
                ]}
            />

            <MenuDivider />

            <MenuSelectHeading />

            <MenuDivider />

            <MenuSelectFontSize />

            <MenuDivider />

            <MenuButtonBold />

            <MenuButtonItalic />

            <MenuButtonUnderline />

            <MenuButtonStrikethrough />

            <MenuButtonSubscript />

            <MenuButtonSuperscript />

            <MenuDivider />

            <MenuButtonTextColor
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
                swatchColors={[
                    { value: "#595959", label: "Dark grey" },
                    { value: "#dddddd", label: "Light grey" },
                    { value: "#ffa6a6", label: "Light red" },
                    { value: "#ffd699", label: "Light orange" },
                    // Plain yellow matches the browser default `mark` like when using Cmd+Shift+H
                    { value: "#ffff00", label: "Yellow" },
                    { value: "#99cc99", label: "Light green" },
                    { value: "#90c6ff", label: "Light blue" },
                    { value: "#8085e9", label: "Light purple" },
                ]}
            />

            <MenuDivider />

            {!isComment && <MenuButtonEditLink />}

            {!isComment && <MenuDivider />}

            <MenuSelectTextAlign
                emptyLabel={
                    <FormatAlignLeftIcon
                        sx={{ fontSize: "1.25rem", color: theme.palette.action.active }}
                    />
                }
            />

            <MenuDivider />

            <MenuButtonOrderedList />

            <MenuButtonBulletedList />

            <MenuButtonTaskList />

            {/* On touch devices, we'll show indent/unindent buttons, since they're
      unlikely to have a keyboard that will allow for using Tab/Shift+Tab. These
      buttons probably aren't necessary for keyboard users and would add extra
      clutter. */}
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
}
