import { Extension } from "@tiptap/core";
import { Plugin, TextSelection } from "@tiptap/pm/state";
import {
    collectClipboardImageFiles,
    filterAcceptedImageFiles,
    insertUploadedImagesWithAlert,
} from "@/features/boards/lib/insertEditorImages";

/** 클립보드·드래그 이미지 → media 업로드 후 삽입 */
const BoardImagePaste = Extension.create({
    name: "boardImagePaste",

    addProseMirrorPlugins() {
        const editor = this.editor;

        return [
            new Plugin({
                props: {
                    handlePaste(_view, event) {
                        const clipboardData = event.clipboardData;
                        if (!clipboardData) return false;

                        const imageFiles = collectClipboardImageFiles(clipboardData);
                        if (imageFiles.length === 0) return false;

                        event.preventDefault();
                        void insertUploadedImagesWithAlert(editor, imageFiles);
                        return true;
                    },

                    handleDrop(view, event) {
                        const dataTransfer = event.dataTransfer;
                        if (!dataTransfer?.files?.length) return false;

                        const imageFiles = filterAcceptedImageFiles(dataTransfer.files);
                        if (imageFiles.length === 0) return false;

                        event.preventDefault();

                        const coords = view.posAtCoords({
                            left: event.clientX,
                            top: event.clientY,
                        });
                        if (coords) {
                            const selection = TextSelection.near(
                                view.state.doc.resolve(coords.pos),
                            );
                            view.dispatch(view.state.tr.setSelection(selection));
                        }

                        void insertUploadedImagesWithAlert(editor, imageFiles);
                        return true;
                    },
                },
            }),
        ];
    },
});

export default BoardImagePaste;
