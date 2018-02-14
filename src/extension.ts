import { languages, window, workspace } from "vscode";
import { ExtensionContext, TextEditor, TextEditorSelectionChangeEvent, WorkspaceConfiguration } from "vscode";

import { XmlFormatter } from "./formatting/xml-formatter";
import { XmlFormattingEditProvider } from "./formatting/xml-formatting-edit-provider";
import { ClassicXmlFormatter } from "./formatting/formatters/classic-xml-formatter";
import { V2XmlFormatter } from "./formatting/formatters/v2-xml-formatter";
import { XQueryLinter } from "./linting/xquery-linter";

import * as constants from "./constants";

export function activate(context: ExtensionContext) {
    const config = workspace.getConfiguration(constants.extensionPrefix);

    /* Formatting Features */
    const xmlFormatterImplementationSetting = config.get<string>("xmlFormatterImplementation");
    let xmlFormatterImplementation: XmlFormatter;

    switch (xmlFormatterImplementationSetting) {
        case "v2": xmlFormatterImplementation = new V2XmlFormatter(); break;
        case "classic": default: xmlFormatterImplementation = new ClassicXmlFormatter(); break;
    }

    const xmlFormattingEditProvider = new XmlFormattingEditProvider(config, xmlFormatterImplementation);

    context.subscriptions.push(
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
