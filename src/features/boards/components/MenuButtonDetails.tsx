import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { MenuButton, useRichTextEditorContext } from "mui-tiptap";
import type { MenuButtonProps } from "mui-tiptap";
import { openAllDetails } from "@/features/boards/lib/detailsDom";

export default function MenuButtonDetails(props: Partial<MenuButtonProps>) {
    const editor = useRichTextEditorContext();
    const active = editor?.isActive("details") ?? false;

    return (
        <MenuButton
            tooltipLabel="접기 블록"
            IconComponent={UnfoldMoreIcon}
            selected={active}
            disabled={
                !editor?.isEditable ||
                (active ? !editor.can().unsetDetails() : !editor.can().setDetails())
            }
            onClick={() => {
                if (!editor) return;
                if (active) {
                    editor.chain().focus().unsetDetails().run();
                } else {
                    editor.chain().focus().setDetails().run();
                    requestAnimationFrame(() => openAllDetails(editor.view.dom));
                }
            }}
            {...props}
        />
    );
}
