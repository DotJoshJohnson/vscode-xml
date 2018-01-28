import { commands, languages, workspace } from "vscode";
import {
    CancellationToken, DocumentFormattingEditProvider, DocumentRangeFormattingEditProvider, ExtensionContext,
    FormattingOptions, ProviderResult, Range, TextDocument, TextEdit, TextEditor, WorkspaceConfiguration
} from "vscode";

import * as constants from "../constants";
import * as extension from "../extension";
import { XmlFormatter } from "./xml-formatter";

import { ClassicXmlFormatter } from "./formatters/classic-xml-formatter";

extension.onActivate((context: ExtensionContext, config: WorkspaceConfiguration) => {
    const xmlFormatterImplementationSetting = config.get<string>("xmlFormatterImplementation");
    let xmlFormatterImplementation: XmlFormatter;

    switch (xmlFormatterImplementationSetting) {
        case "classic":
        default: xmlFormatterImplementation = new ClassicXmlFormatter(); break;
    }

    // tslint:disable-next-line:no-use-before-declare
    const xmlFormattingEditProvider = new XmlFormattingEditProvider(config, xmlFormatterImplementation);

    const formatAsXmlCommand = commands.registerTextEditorCommand("xmlTools.formatAsXml", (textEditor) => {
        // TODO: implement command
    });

    const minifyXmlCommand = commands.registerTextEditorCommand("xmlTools.minifyXml", (textEditor: TextEditor) => {
        // TODO: implement command
    });

    context.subscriptions.push(
        formatAsXmlCommand,
        minifyXmlCommand,
        languages.registerDocumentFormattingEditProvider("xml", xmlFormattingEditProvider),
        languages.registerDocumentRangeFormattingEditProvider("xml", xmlFormattingEditProvider)
    );
});

export class XmlFormattingEditProvider implements DocumentFormattingEditProvider, DocumentRangeFormattingEditProvider {

    constructor(
        public workspaceConfiguration: WorkspaceConfiguration,
        public xmlFormatter: XmlFormatter
    ) { }

    provideDocumentFormattingEdits(document: TextDocument, options: FormattingOptions, token: CancellationToken): ProviderResult<TextEdit[]> {
        const lastLine = document.lineAt(document.lineCount - 1);
        const documentRange = new Range(document.positionAt(0), lastLine.range.end);

        return this.provideDocumentRangeFormattingEdits(document, documentRange, options, token);
    }

    provideDocumentRangeFormattingEdits(document: TextDocument, range: Range, options: FormattingOptions, token: CancellationToken): ProviderResult<TextEdit[]> {
        // override global configuration (issue #128)
        this.workspaceConfiguration = workspace.getConfiguration(constants.extensionPrefix, document.uri);

        let xml = document.getText(range);

        xml = this.xmlFormatter.formatXml(xml, {
            editorOptions: options,
            newLine: document.eol.toString(),
            removeCommentsOnMinify: this.workspaceConfiguration.get<boolean>("removeCommentsOnMinify"),
            splitXmlnsOnFormat: this.workspaceConfiguration.get<boolean>("splitXmlnsOnFormat")
        });

        return [ TextEdit.replace(range, xml) ];
    }
}
