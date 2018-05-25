import { workspace } from "vscode";
import { ProviderResult, Range, TextEdit, TextEditor, TextEditorEdit } from "vscode";

import * as constants from "../../constants";

import { XmlFormatterFactory } from "../xml-formatter";
import { XmlFormattingEditProvider } from "../xml-formatting-edit-provider";
import { XmlFormattingOptionsFactory } from "../xml-formatting-options";

export function minifyXml(editor: TextEditor, edit: TextEditorEdit): void {
    const xmlFormatter = XmlFormatterFactory.getXmlFormatter();
    const xmlFormattingOptions = XmlFormattingOptionsFactory.getXmlFormattingOptions({
        insertSpaces: <boolean>editor.options.insertSpaces,
        tabSize: <number>editor.options.tabSize
    }, editor.document);

    const endPosition = editor.document.lineAt(editor.document.lineCount - 1).rangeIncludingLineBreak.end;
    const range = new Range(editor.document.positionAt(0), endPosition);

    edit.replace(range, xmlFormatter.minifyXml(editor.document.getText(), xmlFormattingOptions));
}
