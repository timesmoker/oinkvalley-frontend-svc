import { useEffect } from "react";
import type { Editor } from "@tiptap/react";

/** Drag handle 누른 채·블록 드래그 중에도 페이지 휠 스크롤 허용 */
export function useEditorDragWheelScroll(editor: Editor) {
  useEffect(() => {
    let handlePressed = false;

    const scrollByWheel = (event: WheelEvent) => {
      if (!handlePressed && !editor.view.dragging) return;
      window.scrollBy({ top: event.deltaY, left: event.deltaX });
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".drag-handle")) {
        handlePressed = true;
      }
    };

    const onPointerUp = () => {
      handlePressed = false;
    };

    window.addEventListener("wheel", scrollByWheel, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("wheel", scrollByWheel);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [editor]);
}
