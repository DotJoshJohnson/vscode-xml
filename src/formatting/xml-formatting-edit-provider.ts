import { workspace } from "vscode";
import {
    CancellationToken, DocumentFormattingEditProvider, DocumentRangeFormattingEditProvider, EndOfLine,
    FormattingOptions, ProviderResult, Range, TextDocument, TextEdit
} from "vscode";

import * as constants from "../constants";
import { XmlFormatter } from "./xml-formatter";
import { XmlFormattingOptionsFactory } from "./xml-formatting-options";

export class XmlFormattingEditProvider implements DocumentFormattingEditProvider, DocumentRangeFormattingEditProvider {

    constructor(
        public xmlFormatter: XmlFormatter
    ) { }

    provideDocumentFormattingEdits(document: TextDocument, options: FormattingOptions, token: CancellationToken): ProviderResult<TextEdit[]> {
        const lastLine = document.lineAt(document.lineCount - 1);
        const documentRange = new Range(document.positionAt(0), lastLine.range.end);

        return this.provideDocumentRangeFormattingEdits(document, documentRange, options, token);
    }

    provideDocumentRangeFormattingEdits(document: TextDocument, range: Range, options: FormattingOptions, token: CancellationToken): ProviderResult<TextEdit[]> {
        let xml = document.getText(range);

        xml = this.xmlFormatter.formatXml(xml, XmlFormattingOptionsFactory.getXmlFormattingOptions(options, document));

        return [ TextEdit.replace(range, xml) ];
    }
}
