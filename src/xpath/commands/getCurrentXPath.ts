import { window } from "vscode";
import { TextEditor, TextEditorEdit } from "vscode";
import { DOMParser } from "xmldom";

import { XPathBuilder } from "../xpath-builder";

export function getCurrentXPath(editor: TextEditor, edit: TextEditorEdit): void {
    if (!editor.selection) {
        window.showInformationMessage("Please put your cursor in an element or attribute name.");

        return;
    }

    const document = new DOMParser().parseFromString(editor.document.getText());
    const xpath = new XPathBuilder(document).build(editor.selection.start);

    window.showInputBox({
        value: xpath,
        valueSelection: undefined
    });
}
