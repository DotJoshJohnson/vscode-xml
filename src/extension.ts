import { languages, window, workspace, commands } from "vscode";
import { ExtensionContext, Memento, TextEditor, TextEditorSelectionChangeEvent, WorkspaceConfiguration } from "vscode";

import { createDocumentSelector } from "./common/create-document-selector";
import { XQueryCompletionItemProvider } from "./completion/xquery-completion-item-provider";
import { formatAsXml } from "./formatting/commands/formatAsXml";
import { minifyXml } from "./formatting/commands/minifyXml";
import { XmlFormatterFactory } from "./formatting/xml-formatter";
import { XmlFormattingEditProvider } from "./formatting/xml-formatting-edit-provider";
import { XQueryLinter } from "./linting/xquery-linter";
import { XmlTreeDataProvider } from "./tree-view/xml-tree-data-provider";
import { evaluateXPath } from "./xpath/commands/evaluateXPath";
import { executeXQuery } from "./xquery-execution/commands/executeXQuery";

import * as constants from "./constants";

export const ExtensionState: { global?: Memento, workspace?: Memento } = { };

export function activate(context: ExtensionContext) {
    ExtensionState.global = context.globalState;
    ExtensionState.workspace = context.workspaceState;

    const config = workspace.getConfiguration(constants.extensionPrefix);

    const xmlXsdDocSelector = [...createDocumentSelector(constants.languageIds.xml), ...createDocumentSelector(constants.languageIds.xsd)];
    const xqueryDocSelector = createDocumentSelector(constants.languageIds.xquery);

    /* Completion Features */
    context.subscriptions.push(
        languages.registerCompletionItemProvider(xqueryDocSelector, new XQueryCompletionItemProvider(), ":", "$")
    );

    /* Formatting Features */
    const xmlFormattingEditProvider = new XmlFormattingEditProvider(config, XmlFormatterFactory.getXmlFormatter());

    context.subscriptions.push(
        commands.registerTextEditorCommand(constants.commands.formatAsXml, formatAsXml),
        commands.registerTextEditorCommand(constants.commands.minifyXml, minifyXml),
        languages.registerDocumentFormattingEditProvider(xmlXsdDocSelector, xmlFormattingEditProvider),
        languages.registerDocumentRangeFormattingEditProvider(xmlXsdDocSelector, xmlFormattingEditProvider)
    );

    /* Linting Features */
    context.subscriptions.push(
        window.onDidChangeActiveTextEditor(_handleChangeActiveTextEditor),
        window.onDidChangeTextEditorSelection(_handleChangeTextEditorSelection)
    );

    /* Tree View Features */
    context.subscriptions.push(
        window.registerTreeDataProvider(constants.views.xmlTreeView, new XmlTreeDataProvider(context))
    );

    /* XPath Features */
    context.subscriptions.push(
        commands.registerTextEditorCommand(constants.commands.evaluateXPath, evaluateXPath)
    );

    /* XQuery Features */
    context.subscriptions.push(
        commands.registerTextEditorCommand(constants.commands.executeXQuery, executeXQuery)
    );
}

export function deactivate() {
    // do nothing
}


function _handleContextChange(editor: TextEditor): void {
    const supportedSchemes = [constants.uriSchemes.file, constants.uriSchemes.untitled];

    if (!editor || !editor.document || supportedSchemes.indexOf(editor.document.uri.scheme) === -1) {
        return;
    }

    switch (editor.document.languageId) {
        case constants.languageIds.xquery:
            languages
                .createDiagnosticCollection(constants.diagnosticCollections.xquery)
                .set(editor.document.uri, new XQueryLinter().lint(editor.document.getText()));
            break;
    }
}

function _handleChangeActiveTextEditor(editor: TextEditor): void {
    _handleContextChange(editor);
}

function _handleChangeTextEditorSelection(e: TextEditorSelectionChangeEvent): void {
    _handleContextChange(e.textEditor);
}
