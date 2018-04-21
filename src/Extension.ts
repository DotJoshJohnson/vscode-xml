import * as vsc from "vscode";
import { TextEditorCommands } from "./Commands";
import { XmlFormattingEditProvider } from "./providers/Formatting";
import { XQueryLintingFeatureProvider } from "./providers/Linting";
import { XQueryCompletionItemProvider } from "./providers/Completion";
import { XmlTreeViewDataProvider } from "./providers/XmlTreeView";

export var GlobalState: vsc.Memento;
export var WorkspaceState: vsc.Memento;

function createSelector(language: string): vsc.DocumentFilter[] {
    return [
        { language, scheme: "file" },
        { language, scheme: "untitled" },
    ];
}

const SELECTOR_XML_XSL: vsc.DocumentSelector = [...createSelector("xml"), ...createSelector("xsl")];
const SELECTOR_XQUERY: vsc.DocumentSelector = createSelector("xquery");

const MEM_QUERY_HISTORY: string = "xpathQueryHistory";

export function activate(ctx: vsc.ExtensionContext) {
    console.log("activate extension");
    // expose global and workspace state to the entire extension
    GlobalState = ctx.globalState;
    WorkspaceState = ctx.workspaceState;
    
	// register palette commands
    ctx.subscriptions.push(
        vsc.commands.registerTextEditorCommand("xmlTools.minifyXml", TextEditorCommands.minifyXml),
        vsc.commands.registerTextEditorCommand("xmlTools.evaluateXPath", TextEditorCommands.evaluateXPath),
        vsc.commands.registerTextEditorCommand("xmlTools.executeXQuery", TextEditorCommands.executeXQuery),
        vsc.commands.registerTextEditorCommand("xmlTools.formatAsXml", TextEditorCommands.formatAsXml)
    );
	
	// register language feature providers
    ctx.subscriptions.push(
        vsc.languages.registerDocumentFormattingEditProvider(SELECTOR_XML_XSL, new XmlFormattingEditProvider()),
        vsc.languages.registerDocumentRangeFormattingEditProvider(SELECTOR_XML_XSL, new XmlFormattingEditProvider()),
        
        vsc.languages.registerCompletionItemProvider(SELECTOR_XQUERY, new XQueryCompletionItemProvider(), ":", "$")
    );
    
    // listen to editor events (for linting)
    ctx.subscriptions.push(
        vsc.window.onDidChangeActiveTextEditor(_handleChangeActiveTextEditor),
        vsc.window.onDidChangeTextEditorSelection(_handleChangeTextEditorSelection)
    );

    // add views
    ctx.subscriptions.push(
        vsc.window.registerTreeDataProvider("xmlTreeView", new XmlTreeViewDataProvider(ctx))
    );
}

export function deactivate() {
    // clean up xpath history
    let memento: vsc.Memento = WorkspaceState || GlobalState;
    let history = memento.get<any[]>(MEM_QUERY_HISTORY, []);
    history.splice(0);
    memento.update(MEM_QUERY_HISTORY, history);
}

function _handleContextChange(editor: vsc.TextEditor): void {
    if (!editor || !editor.document || editor.document.uri.scheme !== "file") {
        return;
    }
    
    switch (editor.document.languageId) {
        case "xquery":
            XQueryLintingFeatureProvider.provideXQueryDiagnostics(editor);
            break;
    }
}

function _handleChangeActiveTextEditor(editor: vsc.TextEditor): void {
    _handleContextChange(editor);
}

function _handleChangeTextEditorSelection(e: vsc.TextEditorSelectionChangeEvent): void {
    _handleContextChange(e.textEditor);
}