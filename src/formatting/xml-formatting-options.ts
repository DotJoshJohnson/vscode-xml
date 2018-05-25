import { EndOfLine, FormattingOptions, TextDocument } from "vscode";

import { Configuration } from "../common";
import * as constants from "../constants";

export interface XmlFormattingOptions {
    editorOptions: FormattingOptions;
    newLine: string;
    removeCommentsOnMinify: boolean;
    splitAttributesOnFormat: boolean;
    splitXmlnsOnFormat: boolean;
}

export class XmlFormattingOptionsFactory {
    static getXmlFormattingOptions(formattingOptions: FormattingOptions, document: TextDocument): XmlFormattingOptions {
        return {
            editorOptions: formattingOptions,
            newLine: (document.eol === EndOfLine.CRLF) ? "\r\n" : "\n",
            removeCommentsOnMinify: Configuration.removeCommentsOnMinify(document.uri),
            splitAttributesOnFormat: Configuration.splitAttributesOnFormat(document.uri),
            splitXmlnsOnFormat: Configuration.splitXmlnsOnFormat(document.uri)
        };
    }
}
