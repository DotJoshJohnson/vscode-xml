import { workspace } from "vscode";
import { EndOfLine, FormattingOptions } from "vscode";

import * as constants from "../constants";

export interface XmlFormattingOptions {
    editorOptions: FormattingOptions;
    newLine: string;
    removeCommentsOnMinify: boolean;
    splitAttributesOnFormat: boolean;
    splitXmlnsOnFormat: boolean;
}

export class XmlFormattingOptionsFactory {
    static getXmlFormattingOptions(formattingOptions: FormattingOptions, eol: EndOfLine): XmlFormattingOptions {
        const config = workspace.getConfiguration(constants.extensionPrefix);

        return {
            editorOptions: formattingOptions,
            newLine: (eol === EndOfLine.CRLF) ? "\r\n" : "\n",
            removeCommentsOnMinify: config.get<boolean>("removeCommentsOnMinify"),
            splitAttributesOnFormat: config.get<boolean>("splitAttributesOnFormat"),
            splitXmlnsOnFormat: config.get<boolean>("splitXmlnsOnFormat")
        };
    }
}
