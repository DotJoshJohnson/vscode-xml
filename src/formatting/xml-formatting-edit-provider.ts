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
        const allXml = document.getText();
        let selectedXml = document.getText(range);
        const extFormattingOptions = XmlFormattingOptionsFactory.getXmlFormattingOptions(options, document);

        const selectionStartOffset = document.offsetAt(range.start);
        let tabCount = 0;
        let spaceCount = 0;

        for (let i = (selectionStartOffset - 1); i >= 0; i--) {
            const cc = allXml.charAt(i);

            if (/\t/.test(cc)) {
                tabCount++;
            }

            else if (/ /.test(cc)) {
                spaceCount++;
            }

            else {
                break;
            }
        }

        if (options.insertSpaces) {
            extFormattingOptions.initialIndentLevel = Math.ceil(spaceCount / (options.tabSize || 1));
        }

        else {
            extFormattingOptions.initialIndentLevel = tabCount;
        }

        selectedXml = this.xmlFormatter.formatXml(selectedXml, extFormattingOptions);

        // we need to remove the leading whitespace because the formatter will add an indent before the first element
        selectedXml = selectedXml.replace(/^\s+/, "");

        return [TextEdit.replace(range, selectedXml)];
    }
}
