import { FormattingOptions } from "vscode";

export interface XmlFormattingOptions {
    editorOptions: FormattingOptions;
    newLine: string;
    removeCommentsOnMinify: boolean;
    splitAttributesOnFormat: boolean;
    splitXmlnsOnFormat: boolean;
}
