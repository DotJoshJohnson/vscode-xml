import { languages, window, workspace, commands } from "vscode";
import { ExtensionContext, TextEditor, TextEditorSelectionChangeEvent, WorkspaceConfiguration } from "vscode";

import { FormatAsXmlCommandName, formatAsXml } from "./formatting/commands/formatAsXml";
import { XmlFormatterFactory } from "./formatting/xml-formatter";
import { XmlFormattingEditProvider } from "./formatting/xml-formatting-edit-provider";
import { XQueryLinter } from "./linting/xquery-linter";

import * as constants from "./constants";

export function activate(context: ExtensionContext) {
    const config = workspace.getConfiguration(constants.extensionPrefix);

    /* Formatting Features */
    const xmlFormattingEditProvider = new XmlFormattingEditProvider(config, XmlFormatterFactory.getXmlFormatter());

    context.subscriptions.push(
        commands.registerTextEditorCommand(FormatAsXmlCommandName, formatAsXml),
        languages.registerDocumentFormattingEditProvider("xml", xmlFormattingEditProvider),
        languages.registerDocumentRangeFormattingEditProvider("xml", xmlFormattingEditProvider)
    );

    /* Linting Features */
    context.subscriptions.push(
        window.onDidChangeActiveTextEditor(_handleChangeActiveTextEditor),
        window.onDidChangeTextEditorSelection(_handleChangeTextEditorSelection)
    );
}

export function deactivate() {
    // do nothing
}


function _handleContextChange(editor: TextEditor): void {
    if (!editor || !editor.document) {
        return;
    }

    switch (editor.document.languageId) {
        case "xquery":
            languages.createDiagnosticCollection("XQueryDiagnostics").set(editor.document.uri, new XQueryLinter().lint(editor.document.getText()));
            break;
    }
}

function _handleChangeActiveTextEditor(editor: TextEditor): void {
    _handleContextChange(editor);
}

function _handleChangeTextEditorSelection(e: TextEditorSelectionChangeEvent): void {
    _handleContextChange(e.textEditor);
}
