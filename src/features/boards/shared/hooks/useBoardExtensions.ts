import type { EditorOptions } from "@tiptap/core";
import type { TableOfContentData } from "@tiptap/extension-table-of-contents";
import { useMemo } from "react";
import { buildBoardExtensions } from "@/features/boards/shared/hooks/boardExtensions/buildBoardExtensions";

export type UseExtensionsOptions = {
  placeholder?: string;
  scope?: "post" | "comment";
  mode?: "edit" | "view";
  onTableOfContentsUpdate?: (data: TableOfContentData) => void;
};

export default function useBoardExtensions({
  placeholder,
  scope = "post",
  mode = "edit",
  onTableOfContentsUpdate,
}: UseExtensionsOptions = {}): EditorOptions["extensions"] {
  return useMemo(
    () =>
      buildBoardExtensions({
        placeholder,
        scope,
        mode,
        onTableOfContentsUpdate,
      }),
    [placeholder, scope, mode, onTableOfContentsUpdate],
  );
}
