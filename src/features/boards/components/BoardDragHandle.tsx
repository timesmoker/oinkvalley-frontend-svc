"use client";

import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import type { Editor } from "@tiptap/react";
import type { Props as TippyProps } from "tippy.js";

export default function BoardDragHandle({
    editor,
    tippyOptions,
}: {
    editor: Editor;
    tippyOptions: Partial<TippyProps>;
}) {
    return (
        <DragHandle editor={editor} tippyOptions={tippyOptions}>
            <DragIndicatorIcon
                fontSize="small"
                sx={{ color: "text.secondary", cursor: "grab", "&:active": { cursor: "grabbing" } }}
            />
        </DragHandle>
    );
}
