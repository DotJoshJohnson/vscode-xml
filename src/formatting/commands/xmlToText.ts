import { workspace } from "vscode";
import { ProviderResult, Range, TextEdit, TextEditor, Selection } from "vscode";

import { NativeCommands } from "../../common";
import * as constants from "../../constants";

import { XmlFormatterFactory } from "../xml-formatter";
import { XmlFormattingEditProvider } from "../xml-formatting-edit-provider";
import { XmlFormattingOptionsFactory } from "../xml-formatting-options";

export function xmlToText(textEditor: TextEditor): void {
    textEditor.edit(textEdit => {
        const selections = textEditor.selections;
        selections.forEach(selection => {
            if (selection.isEmpty) {
                selection = new Selection(
                    textEditor.document.positionAt(0),
                    textEditor.document.positionAt(textEditor.document.getText().length)
                );
            }
            const txt = textEditor.document.getText(new Range(selection.start, selection.end));
            const transformed = txt.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            textEdit.replace(selection, transformed);
        });
    });
}
