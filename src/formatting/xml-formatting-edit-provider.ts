import { workspace } from "vscode";
import {
    CancellationToken, DocumentFormattingEditProvider, DocumentRangeFormattingEditProvider, EndOfLine,
    FormattingOptions, ProviderResult, Range, TextDocument, TextEdit, WorkspaceConfiguration
} from "vscode";

import * as constants from "../constants";
import { XmlFormatter } from "./xml-formatter";
import { XmlFormattingOptionsFactory } from "./xml-formatting-options";

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

        xml = this.xmlFormatter.formatXml(xml, XmlFormattingOptionsFactory.getXmlFormattingOptions(options, document.eol));

        return [ TextEdit.replace(range, xml) ];
    }
}
