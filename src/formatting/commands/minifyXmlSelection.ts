import { workspace } from "vscode";
import { Range, TextEditor, TextEditorEdit } from "vscode";

import { XmlFormatterFactory } from "../xml-formatter";
import { XmlFormattingOptionsFactory } from "../xml-formatting-options";

export function minifyXmlSelection(editor: TextEditor, edit: TextEditorEdit): void {
    const xmlFormatter = XmlFormatterFactory.getXmlFormatter();
    const xmlFormattingOptions = XmlFormattingOptionsFactory.getXmlFormattingOptions({
        insertSpaces: <boolean>editor.options.insertSpaces,
        tabSize: <number>editor.options.tabSize
    }, editor.document);

    editor.selections.reverse().forEach(selection => {
        const range = new Range(selection.start, selection.end);

        edit.replace(range, xmlFormatter.minifyXml(editor.document.getText(range), xmlFormattingOptions));
    });
}
