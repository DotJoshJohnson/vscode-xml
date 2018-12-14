import {
    commands, languages, window, workspace, ExtensionContext, Memento,
    TextEditor, TextEditorSelectionChangeEvent, TextEditorSelectionChangeKind, DiagnosticCollection
    } from "vscode";

import { createDocumentSelector, ExtensionState, Configuration } from "./common";
import { XQueryCompletionItemProvider } from "./completion";
import { XmlFormatterFactory, XmlFormattingEditProvider } from "./formatting";
import { formatAsXml, minifyXml, xmlToText, textToXml } from "./formatting/commands";
import { XQueryLinter } from "./linting";
import { XmlTreeDataProvider } from "./tree-view";
import { evaluateXPath, getCurrentXPath } from "./xpath/commands";
import { executeXQuery } from "./xquery-execution/commands";

import * as constants from "./constants";

let diagnosticCollectionXQuery: DiagnosticCollection;

export function activate(context: ExtensionContext) {
    ExtensionState.configure(context);

    const xmlXsdDocSelector = [...createDocumentSelector(constants.languageIds.xml), ...createDocumentSelector(constants.languageIds.xsd)];
    const xqueryDocSelector = createDocumentSelector(constants.languageIds.xquery);

    /* Completion Features */
    context.subscriptions.push(
        languages.registerCompletionItemProvider(xqueryDocSelector, new XQueryCompletionItemProvider(), ":", "$")
    );

    /* Formatting Features */
    const xmlFormattingEditProvider = new XmlFormattingEditProvider(XmlFormatterFactory.getXmlFormatter());

    context.subscriptions.push(
        commands.registerTextEditorCommand(constants.commands.formatAsXml, formatAsXml),
        commands.registerTextEditorCommand(constants.commands.xmlToText, xmlToText),
        commands.registerTextEditorCommand(constants.commands.textToXml, textToXml),
        commands.registerTextEditorCommand(constants.commands.minifyXml, minifyXml),
        languages.registerDocumentFormattingEditProvider(xmlXsdDocSelector, xmlFormattingEditProvider),
        languages.registerDocumentRangeFormattingEditProvider(xmlXsdDocSelector, xmlFormattingEditProvider)
    );

    /* Linting Features */
    diagnosticCollectionXQuery = languages.createDiagnosticCollection(constants.diagnosticCollections.xquery);
    context.subscriptions.push(
        diagnosticCollectionXQuery,
        window.onDidChangeActiveTextEditor(_handleChangeActiveTextEditor),
        window.onDidChangeTextEditorSelection(_handleChangeTextEditorSelection)
    );

    /* Tree View Features */
    const treeViewDataProvider = new XmlTreeDataProvider(context);
    const treeView = window.createTreeView<Node>(constants.views.xmlTreeView, {
        treeDataProvider: treeViewDataProvider
    });

    if (Configuration.enableXmlTreeViewCursorSync) {
        window.onDidChangeTextEditorSelection(x => {
            if (x.kind === TextEditorSelectionChangeKind.Mouse && x.selections.length > 0) {
                treeView.reveal(treeViewDataProvider.getNodeAtPosition(x.selections[0].start));
            }
        });
    }

    context.subscriptions.push(
        treeView
    );

    /* XPath Features */
    context.subscriptions.push(
        commands.registerTextEditorCommand(constants.commands.evaluateXPath, evaluateXPath),
        commands.registerTextEditorCommand(constants.commands.getCurrentXPath, getCurrentXPath)
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
      diagnosticCollectionXQuery.set(editor.document.uri, new XQueryLinter().lint(editor.document.getText()));
            break;
    }
}

function _handleChangeActiveTextEditor(editor: TextEditor): void {
    _handleContextChange(editor);
}

function _handleChangeTextEditorSelection(e: TextEditorSelectionChangeEvent): void {
    _handleContextChange(e.textEditor);
}
