import { Box } from "@mui/material";
import { MenuButtonRedo, MenuButtonUndo } from "mui-tiptap";

export default function BoardEditorSideToolbarUndoRedo() {
    return (
        <Box
            className="board-editor-side-toolbar-undo-redo"
            sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 0,
                width: "100%",
                "& .MuiToggleButton-root": {
                    width: 26,
                    height: 26,
                    minWidth: 26,
                    padding: 0,
                },
                "& .MuiSvgIcon-root": {
                    fontSize: "1rem",
                },
            }}
        >
            <MenuButtonUndo />
            <MenuButtonRedo />
        </Box>
    );
}
