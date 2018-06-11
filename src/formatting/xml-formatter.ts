import { window, workspace } from "vscode";

import { Configuration, ExtensionState } from "../common";
import * as constants from "../constants";
import { ClassicXmlFormatter } from "./formatters/classic-xml-formatter";
import { V2XmlFormatter } from "./formatters/v2-xml-formatter";

import { XmlFormattingOptions } from "./xml-formatting-options";

export interface XmlFormatter {
    formatXml(xml: string, options: XmlFormattingOptions): string;
    minifyXml(xml: string, options: XmlFormattingOptions): string;
}

export class XmlFormatterFactory {
    private static _xmlFormatter: XmlFormatter;

    static getXmlFormatter(): XmlFormatter {
        if (XmlFormatterFactory._xmlFormatter) {
            return XmlFormatterFactory._xmlFormatter;
        }

        const xmlFormatterImplementationSetting = Configuration.xmlFormatterImplementation;
        let xmlFormatterImplementation: XmlFormatter;

        switch (xmlFormatterImplementationSetting) {
            case constants.xmlFormatterImplementations.classic: xmlFormatterImplementation = new ClassicXmlFormatter(); break;
            case constants.xmlFormatterImplementations.v2:
            default: xmlFormatterImplementation = new V2XmlFormatter(); break;
        }

        // warn users about the new formatter
        const formatterWarningKey = "xmlTools.v2FormatterWarning.shown";

        if (!ExtensionState.global.get<boolean>(formatterWarningKey) && xmlFormatterImplementation instanceof V2XmlFormatter) {
            // tslint:disable-next-line:max-line-length
            window.showInformationMessage("Heads up! We've rewritten the XML formatter. If you liked the old one better, it's still there. Just set the 'xmlTools.xmlFormatterImplementation' setting to 'classic'.")
                .then(() => {
                    ExtensionState.global.update(formatterWarningKey, true);
                });
        }

        return (XmlFormatterFactory._xmlFormatter = xmlFormatterImplementation);
    }
}
