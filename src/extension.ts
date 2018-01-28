import { languages, workspace } from "vscode";
import { ExtensionContext, WorkspaceConfiguration } from "vscode";

import { XmlFormatter } from "./formatting/xml-formatter";
import { XmlFormattingEditProvider } from "./formatting/xml-formatting-edit-provider";
import { ClassicXmlFormatter } from "./formatting/formatters/classic-xml-formatter";
import { V2XmlFormatter } from "./formatting/formatters/v2-xml-formatter";

import * as constants from "./constants";

export function activate(context: ExtensionContext) {
    const config = workspace.getConfiguration(constants.extensionPrefix);

    /* Formatting Features */
    const xmlFormatterImplementationSetting = config.get<string>("xmlFormatterImplementation");
    let xmlFormatterImplementation: XmlFormatter;

    switch (xmlFormatterImplementationSetting) {
        case "v2": xmlFormatterImplementation = new V2XmlFormatter(); break;
        case "classic": default: xmlFormatterImplementation = new ClassicXmlFormatter(); break;
    }

    const xmlFormattingEditProvider = new XmlFormattingEditProvider(config, xmlFormatterImplementation);

    context.subscriptions.push(
        languages.registerDocumentFormattingEditProvider("xml", xmlFormattingEditProvider),
        languages.registerDocumentRangeFormattingEditProvider("xml", xmlFormattingEditProvider)
    );
}

export function deactivate() {
    // do nothing
}
