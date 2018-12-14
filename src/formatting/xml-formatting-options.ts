import { EndOfLine, FormattingOptions, TextDocument } from "vscode";

import { Configuration } from "../common";
import * as constants from "../constants";

export interface XmlFormattingOptions {
    editorOptions: FormattingOptions;
    enforcePrettySelfClosingTagOnFormat: boolean;
    newLine: string;
    removeCommentsOnMinify: boolean;
    splitAttributesOnFormat: boolean;
    splitXmlnsOnFormat: boolean;
    initialIndentLevel?: number;
}

export class XmlFormattingOptionsFactory {
    static getXmlFormattingOptions(formattingOptions: FormattingOptions, document: TextDocument): XmlFormattingOptions {
        return {
            editorOptions: formattingOptions,
            enforcePrettySelfClosingTagOnFormat: Configuration.enforcePrettySelfClosingTagOnFormat(document.uri),
            newLine: (document.eol === EndOfLine.CRLF) ? "\r\n" : "\n",
            removeCommentsOnMinify: Configuration.removeCommentsOnMinify(document.uri),
            splitAttributesOnFormat: Configuration.splitAttributesOnFormat(document.uri),
            splitXmlnsOnFormat: Configuration.splitXmlnsOnFormat(document.uri),
            initialIndentLevel: 0
        };
    }
}
