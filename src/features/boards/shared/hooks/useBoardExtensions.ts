import type { EditorOptions } from "@tiptap/core";
import { useMemo } from "react";
import { buildBoardExtensions } from "@/features/boards/shared/hooks/boardExtensions/buildBoardExtensions";

export type UseExtensionsOptions = {
  placeholder?: string;
  scope?: "post" | "comment";
  mode?: "edit" | "view";
};

export default function useBoardExtensions({
  placeholder,
  scope = "post",
  mode = "edit",
}: UseExtensionsOptions = {}): EditorOptions["extensions"] {
  return useMemo(
    () =>
      buildBoardExtensions({
        placeholder,
        scope,
        mode,
      }),
    [placeholder, scope, mode],
  );
}
