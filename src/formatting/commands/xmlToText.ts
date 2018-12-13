import { workspace } from "vscode";
import { ProviderResult, Range, TextEdit, editor, editorEdit, Selection } from "vscode";

import { NativeCommands } from "../../common";
import * as constants from "../../constants";

import { XmlFormatterFactory } from "../xml-formatter";
import { XmlFormattingEditProvider } from "../xml-formatting-edit-provider";
import { XmlFormattingOptionsFactory } from "../xml-formatting-options";

export function xmlToText(editor: editor, edit: editorEdit): void {
    editor.edit(edit => {
        let selections = editor.selections;
        selections.forEach(selection => {
            if (selection.isEmpty) {
                selection = new Selection(
                    editor.document.positionAt(0),
                    editor.document.positionAt(editor.document.getText().length)
                );
            }
            let txt = editor.document.getText(new Range(selection.start, selection.end));
            let transformed = txt.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            edit.replace(selection, transformed);
        });
    });
}
