import { XmlFormattingOptions } from "./xml-formatting-options";

export interface XmlFormatter {
    formatXml(xml: string, options: XmlFormattingOptions): string;
    minifyXml(xml: string, options: XmlFormattingOptions): string;
}
