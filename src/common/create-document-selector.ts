import { DocumentFilter } from "vscode";

export function createDocumentSelector(language: string): DocumentFilter[] {
    return [
        { language, scheme: "file" },
        { language, scheme: "untitled" },
    ];
}
