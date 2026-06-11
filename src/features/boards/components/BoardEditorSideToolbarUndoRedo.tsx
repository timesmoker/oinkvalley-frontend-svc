import { Box } from "@mui/material";
import { MenuButtonRedo, MenuButtonUndo } from "mui-tiptap";

/** 좌툴바 — 실행 취소·다시 실행 한 칸에 좌우 배치 */
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
