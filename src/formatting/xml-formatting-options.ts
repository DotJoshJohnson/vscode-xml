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
}

export class XmlFormattingOptionsFactory {
    static getXmlFormattingOptions(formattingOptions: FormattingOptions, document: TextDocument): XmlFormattingOptions {
        return {
            editorOptions: formattingOptions,
            enforcePrettySelfClosingTagOnFormat: Configuration.formatterAddSpaceBeforeSelfClose(document.uri),
            newLine: (document.eol === EndOfLine.CRLF) ? "\r\n" : "\n",
            removeCommentsOnMinify: Configuration.formatterRemoveCommentsOnMinify(document.uri),
            splitAttributesOnFormat: Configuration.formatterSplitAttributes(document.uri),
            splitXmlnsOnFormat: Configuration.formatterSplitXmlnsAttributes(document.uri)
        };
    }
}
