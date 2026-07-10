"use client";

import Link from "@mui/icons-material/Link";
import { useRef } from "react";
import { MenuButton, useRichTextEditorContext } from "mui-tiptap";
import { boardEditorSideToolbarLinkBubbleOptions } from "@/features/boards/lib/boardEditorLinkBubbleMenu";

export default function BoardMenuButtonEditLink() {
    const editor = useRichTextEditorContext();
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    return (
        <MenuButton
            buttonRef={buttonRef}
            tooltipLabel="Link"
            tooltipShortcutKeys={["mod", "Shift", "U"]}
            IconComponent={Link}
            selected={editor?.isActive("link")}
            disabled={!editor?.isEditable}
            onClick={() =>
                editor?.commands.openLinkBubbleMenu(
                    boardEditorSideToolbarLinkBubbleOptions,
                )
            }
        />
    );
}
