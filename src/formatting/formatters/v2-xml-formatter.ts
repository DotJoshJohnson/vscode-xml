import { XmlFormatter } from "../xml-formatter";
import { XmlFormattingOptions } from "../xml-formatting-options";
import { ClassicXmlFormatter } from "./classic-xml-formatter";

/* tslint:disable no-use-before-declare */
export class V2XmlFormatter implements XmlFormatter {
    formatXml(xml: string, options: XmlFormattingOptions): string {
        xml = this.minifyXml(xml, options);

        let output = "";

        let indentLevel = 0;
        let location = Location.Text;
        let lastNonTextLocation = Location.Text; // hah

        // NOTE: all "exiting" checks should appear after their associated "entering" checks
        for (let i = 0; i < xml.length; i++) {
            const cc = xml[i];
            const nc = xml.charAt(i + 1);
            const nnc = xml.charAt(i + 2);
            const pc = xml.charAt(i - 1);

            // entering CData
            if (location === Location.Text && cc === "<" && nc === "!" && nnc === "[") {
                output += `${this._getIndent(options, indentLevel)}<`;
                location = Location.CData;
            }

            // exiting CData
            else if (location === Location.CData && cc === "]" && nc === "]" && nnc === ">") {
                output += "]]>";

                i += 2;
                lastNonTextLocation = location;
                location = Location.Text;
            }

            // entering Comment
            else if (location === Location.Text && cc === "<" && nc === "!" && nnc === "-") {
                output += `${this._getIndent(options, indentLevel)}<`;
                location = Location.Comment;
            }

            // exiting Comment
            else if (location === Location.Comment && cc === "-" && nc === "-" && nnc === ">") {
                output += "-->";

                i += 2;
                lastNonTextLocation = location;
                location = Location.Text;
            }

            // entering SpecialTag
            else if (location === Location.Text && cc === "<" && (nc === "!" || nc === "?")) {
                output += `${this._getIndent(options, indentLevel)}<`;
                location = Location.SpecialTag;
            }

            // exiting SpecialTag
            else if (location === Location.SpecialTag && cc === ">") {
                output += `>`;
                lastNonTextLocation = location;
                location = Location.Text;
            }

            // entering StartTag.StartTagName
            else if (location === Location.Text && cc === "<" && ["/", "!"].indexOf(nc) === -1) {
                // if this occurs after another tag, prepend a line break
                if (pc === ">") {
                    output += `${options.newLine}${this._getIndent(options, indentLevel)}<`;
                }

                else {
                    output += `${this._getIndent(options, indentLevel)}<`;
                }

                indentLevel++;
                location = Location.StartTagName;
            }

            // exiting StartTag.StartTagName, enter StartTag
            else if (location === Location.StartTagName && cc === " ") {
                output += " ";
                lastNonTextLocation = location;
                location = Location.StartTag;
            }

            // entering StartTag.Attribute
            else if (location === Location.StartTag && [" ", "/", ">"].indexOf(cc) === -1) {
                if (lastNonTextLocation === Location.AttributeValue
                    && ((options.splitXmlnsOnFormat
                        && xml.substr(i, 5).toLowerCase() === "xmlns")
                        || options.splitAttributesOnFormat)) {
                    output += `${options.newLine}${this._getIndent(options, indentLevel)}`;
                }

                output += cc;
                lastNonTextLocation = location;
                location = Location.Attribute;
            }

            // entering StartTag.Attribute.AttributeValue
            else if (location === Location.Attribute && cc === "\"") {
                output += "\"";
                lastNonTextLocation = location;
                location = Location.AttributeValue;
            }

            // exiting StartTag.Attribute.AttributeValue, entering StartTag
            else if (location === Location.AttributeValue && cc === "\"") {
                output += "\"";
                lastNonTextLocation = location;
                location = Location.StartTag;
            }

            // exiting StartTag or StartTag.StartTagName, entering Text
            else if ((location === Location.StartTag || location === Location.StartTagName) && cc === ">") {
                // if this was a self-closing tag, we need to decrement the indent level and add a newLine
                if (pc === "/") {
                    indentLevel--;
                    output += `>${options.newLine}`;
                }

                // if this is an open tag followed by a line break, add an indent before the text (after the line break)
                // TODO: there could be multiple lines of text here, so we'll need a less naive implementation at some point
                else if (nc === "\r" || nc === "\n") {
                    output += `>${options.newLine}${this._getIndent(options, indentLevel)}`;

                    // fast-forward based on what type of line break was used
                    if (nc === "\r") {
                        i += 2;
                    }

                    else {
                        i++;
                    }
                }

                else {
                    output += ">";
                }

                lastNonTextLocation = location;
                location = Location.Text;
            }

            // entering EndTag
            else if (location === Location.Text && cc === "<" && nc === "/") {
                indentLevel--;

                // if the end tag immediately follows another end tag, add a line break and indent
                // if the end tag immediately follows a line break, just add an indentation
                // otherwise, this should be treated as a same-line end tag(ex. <element>text</element>)
                if (lastNonTextLocation === Location.EndTag) {
                    output += `${options.newLine}${this._getIndent(options, indentLevel)}<`;
                }

                else if (pc === "\n") {
                    output += `${this._getIndent(options, indentLevel)}<`;
                }

                else {
                    output += "<";
                }

                location = Location.EndTag;
            }

            // exiting EndTag, entering Text
            else if (location === Location.EndTag && cc === ">") {
                output += ">";
                lastNonTextLocation = location;
                location = Location.Text;
            }

            // Text
            else {
                output += cc;
            }
        }

        return output;
    }

    minifyXml(xml: string, options: XmlFormattingOptions): string {
        return new ClassicXmlFormatter().minifyXml(xml, options);
    }

    private _getIndent(options: XmlFormattingOptions, indentLevel: number): string {
        return ((options.editorOptions.insertSpaces) ? " ".repeat(options.editorOptions.tabSize) : "\t").repeat(indentLevel);
    }
}

enum Location {
    Attribute,
    AttributeValue,
    CData,
    Comment,
    EndTag,
    SpecialTag,
    StartTag,
    StartTagName,
    Text
}
