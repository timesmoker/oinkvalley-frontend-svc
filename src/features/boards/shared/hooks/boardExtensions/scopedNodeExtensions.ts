import type { EditorOptions } from "@tiptap/core";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import Details from "@tiptap/extension-details";
import DetailsContent from "@tiptap/extension-details-content";
import DetailsSummary from "@tiptap/extension-details-summary";
import { TableImproved } from "mui-tiptap";

export function getTableExtensions(isPost: boolean): EditorOptions["extensions"] {
  if (!isPost) {
    return [];
  }

  return [
    TableImproved.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
  ];
}

export function getDetailsExtensions(isPost: boolean): EditorOptions["extensions"] {
  if (!isPost) {
    return [];
  }

  return [
    Details.configure({
      persist: false,
    }),
    DetailsSummary,
    DetailsContent,
  ];
}
