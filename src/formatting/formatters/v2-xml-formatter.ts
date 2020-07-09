import { XmlFormatter } from "../xml-formatter";
import { XmlFormattingOptions } from "../xml-formatting-options";
import { ClassicXmlFormatter } from "./classic-xml-formatter";

const MagicalStringOfWonders = "~::~MAAAGIC~::~";

/* tslint:disable no-use-before-declare */
export class V2XmlFormatter implements XmlFormatter {
    formatXml(xml: string, options: XmlFormattingOptions): string {
        // this replaces all "<" brackets inside of comments and CDATA to a magical string
        // so the following minification steps don't mess with comment and CDATA formatting
        xml = this._sanitizeCommentsAndCDATA(xml);

        // remove whitespace from between tags, except for line breaks
        xml = xml.replace(/>\s{0,}</g, (match: string) => {
            return match.replace(/[^\S\r\n]/g, "");
        });

        // do some light minification to get rid of insignificant whitespace
        xml = xml.replace(/"\s+(?=[^\s]+=)/g, "\" "); // spaces between attributes
        xml = xml.replace(/"\s+(?=>)/g, "\""); // spaces between the last attribute and tag close (>)
        xml = xml.replace(/"\s+(?=\/>)/g, "\" "); // spaces between the last attribute and tag close (/>)
        xml = xml.replace(/(?!<!\[CDATA\[)[^ <>="]\s+[^ <>="]+=(?![^<]*?\]\]>)/g, (match: string) => { // spaces between the node name and the first attribute
            return match.replace(/\s+/g, " ");
        });

        // the coast is clear - we can drop those "<" brackets back in
        xml = this._unsanitizeCommentsAndCDATA(xml);

        let output = "";

        let indentLevel = options.initialIndentLevel || 0;
        let attributeQuote = "";
        let lineBreakSpree = false;
        let lastWordCharacter: string | undefined;
        let inMixedContent = false;

        const locationHistory: Location[] = [Location.Text];

        function isLastNonTextLocation(loc: Location): boolean {
            for (let i = (locationHistory.length - 1); i >= 0; i--) {
                if (locationHistory[i] !== Location.Text) {
                    return (loc === locationHistory[i]);
                }
            }

            return false;
        }

        function isLocation(loc: Location): boolean {
            return loc === locationHistory[locationHistory.length - 1];
        }

        function refreshMixedContentFlag(): void {
            inMixedContent = (isLastNonTextLocation(Location.StartTag) || isLastNonTextLocation(Location.EndTag)) && lastWordCharacter !== undefined;
        }

        function setLocation(loc: Location): void {
            if (loc === Location.Text) {
                lastWordCharacter = undefined;
            }

            locationHistory.push(loc);
        }

        // NOTE: all "exiting" checks should appear after their associated "entering" checks
        for (let i = 0; i < xml.length; i++) {
            const cc = xml[i];
            const nc = xml.charAt(i + 1);
            const nnc = xml.charAt(i + 2);
            const pc = xml.charAt(i - 1);
            const ppc = xml.charAt(i - 2);

            // entering CData
            if (isLocation(Location.Text) && cc === "<" && nc === "!" && nnc === "[") {
                if (pc === ">" && ppc !== "/") {
                    output += "<";
                }

                else {
                    output += `${this._getIndent(options, indentLevel)}<`;
                }

                setLocation(Location.CData);
            }

            // exiting CData
            else if (isLocation(Location.CData) && cc === "]" && nc === "]" && nnc === ">") {
                output += "]]>";

                i += 2;

                setLocation(Location.Text);
            }

            // entering Comment
            else if (isLocation(Location.Text) && cc === "<" && nc === "!" && nnc === "-") {
                output += `${this._getIndent(options, indentLevel)}<`;

                setLocation(Location.Comment);
            }

            // exiting Comment
            else if (isLocation(Location.Comment) && cc === "-" && nc === "-" && nnc === ">") {
                output += "-->";

                i += 2;

                setLocation(Location.Text);
            }

            // entering SpecialTag
            else if (isLocation(Location.Text) && cc === "<" && (nc === "!" || nc === "?")) {
                output += `${this._getIndent(options, indentLevel)}<`;

                setLocation(Location.SpecialTag);
            }

            // exiting SpecialTag
            else if (isLocation(Location.SpecialTag) && cc === ">") {
                output += `>`;

                setLocation(Location.Text);
            }

            // entering StartTag.StartTagName
            else if (isLocation(Location.Text) && cc === "<" && ["/", "!"].indexOf(nc) === -1) {
                refreshMixedContentFlag();

                // if this occurs after another tag, prepend a line break
                // but do not add one if the previous tag was self-closing (it already adds its own)
                if (pc === ">" && ppc !== "/" && !inMixedContent) {
                    output += `${options.newLine}${this._getIndent(options, indentLevel)}<`;
                }

                else if (!inMixedContent) {
                    // removing trailing non-breaking whitespace here prevents endless indentations (issue #193)
                    output = this._removeTrailingNonBreakingWhitespace(output);
                    output += `${this._getIndent(options, indentLevel)}<`;
                }

                else {
                    output += "<";

                    indentLevel--;
                }

                indentLevel++;

                setLocation(Location.StartTagName);
            }

            // exiting StartTag.StartTagName, enter StartTag
            else if (isLocation(Location.StartTagName) && cc === " ") {
                output += " ";

                setLocation(Location.StartTag);
            }

            // entering StartTag.Attribute
            else if (isLocation(Location.StartTag) && [" ", "/", ">"].indexOf(cc) === -1) {
                if (locationHistory[locationHistory.length - 2] === Location.AttributeValue
                    && ((options.splitXmlnsOnFormat
                        && xml.substr(i, 5).toLowerCase() === "xmlns")
                        || options.splitAttributesOnFormat)) {

                    // trim the end of output here to ensure there is no trailing whitespace (issue #288)
                    output = this._removeTrailingNonBreakingWhitespace(output);

                    output += `${options.newLine}${this._getIndent(options, indentLevel)}`;
                }

                output += cc;

                setLocation(Location.Attribute);
            }

            // entering StartTag.Attribute.AttributeValue
            else if (isLocation(Location.Attribute) && (cc === "\"" || cc === "'")) {
                output += cc;

                setLocation(Location.AttributeValue);

                attributeQuote = cc;
            }

            // exiting StartTag.Attribute.AttributeValue, entering StartTag
            else if (isLocation(Location.AttributeValue) && cc === attributeQuote) {
                output += cc;

                setLocation(Location.StartTag);

                attributeQuote = undefined;
            }

            // approaching the end of a self-closing tag where there was no whitespace (issue #149)
            else if ((isLocation(Location.StartTag) || isLocation(Location.StartTagName))
                && cc === "/"
                && pc !== " "
                && options.enforcePrettySelfClosingTagOnFormat) {
                output += " /";
            }

            // exiting StartTag or StartTag.StartTagName, entering Text
            else if ((isLocation(Location.StartTag) || isLocation(Location.StartTagName)) && cc === ">") {
                // if this was a self-closing tag, we need to decrement the indent level and add a newLine
                if (pc === "/") {
                    indentLevel--;
                    output += ">";

                    // only add a newline here if one doesn't already exist (issue #147)
                    if (nc !== "\r" && nc !== "\n") {
                        output += options.newLine;
                    }
                }

                else {
                    output += ">";
                }

                // don't go directly from StartTagName to Text; go through StartTag first
                if (isLocation(Location.StartTagName)) {
                    setLocation(Location.StartTag);
                }

                setLocation(Location.Text);
            }

            // entering EndTag
            else if (isLocation(Location.Text) && cc === "<" && nc === "/") {
                if (!inMixedContent) {
                    indentLevel--;
                }

                refreshMixedContentFlag();

                // if the end tag immediately follows a line break, just add an indentation
                // if the end tag immediately follows another end tag or a self-closing tag (issue #185), add a line break and indent
                // otherwise, this should be treated as a same-line end tag(ex. <element>text</element>)
                if ((pc === "\n" || lineBreakSpree) && !inMixedContent) {
                    // removing trailing non-breaking whitespace here prevents endless indentations (issue #193)
                    output = this._removeTrailingNonBreakingWhitespace(output);
                    output += `${this._getIndent(options, indentLevel)}<`;
                    lineBreakSpree = false;
                }

                else if (isLastNonTextLocation(Location.EndTag) && !inMixedContent) {
                    output += `${options.newLine}${this._getIndent(options, indentLevel)}<`;
                }

                else if (pc === ">" && ppc === "/" && !inMixedContent) {
                    output += `${this._getIndent(options, indentLevel)}<`;
                }

                else {
                    output += "<";
                }

                setLocation(Location.EndTag);
            }

            // exiting EndTag, entering Text
            else if (isLocation(Location.EndTag) && cc === ">") {
                output += ">";

                setLocation(Location.Text);

                inMixedContent = false;
            }

            // Text
            else {
                if (cc === "\n") {
                    lineBreakSpree = true;
                    lastWordCharacter = undefined;
                }

                else if (lineBreakSpree && /\S/.test(cc)) {
                    lineBreakSpree = false;
                }

                if (/[\w\d]/.test(cc)) {
                    lastWordCharacter = cc;
                }

                output += cc;
            }
        }

        return output;
    }

    minifyXml(xml: string, options: XmlFormattingOptions): string {
        return new ClassicXmlFormatter().minifyXml(xml, options);
    }

    private _getIndent(options: XmlFormattingOptions, indentLevel: number): string {
        return ((options.editorOptions.insertSpaces) ? " ".repeat(options.editorOptions.tabSize) : "\t").repeat(Math.max(indentLevel, 0));
    }

    private _removeTrailingNonBreakingWhitespace(text: string): string {
        return text.replace(/[^\r\n\S]+$/, "");
    }

    private _sanitizeCommentsAndCDATA(xml: string): string {
        let output = "";
        let inCommentOrCDATA = false;

        for (let i = 0; i < xml.length; i++) {
            const cc = xml[i];
            const nc = xml.charAt(i + 1);
            const nnc = xml.charAt(i + 2);
            const pc = xml.charAt(i - 1);

            if (!inCommentOrCDATA && cc === "<" && nc === "!" && (nnc === "-" || nnc === "[")) {
                inCommentOrCDATA = true;
                output += (nnc === "-") ? "<!--" : "<![CDATA[";

                i += (nnc === "-") ? 3 : 8;
            }

            else if (inCommentOrCDATA && cc === "<") {
                output += MagicalStringOfWonders;
            }

            else if (inCommentOrCDATA && (cc === "-" && nc === "-" && nnc === ">") || (cc === "]" && nc === "]" && nnc === ">")) {
                inCommentOrCDATA = false;
                output += (cc === "-") ? "-->" : "]]>";

                i += 2;
            }

            else {
                output += cc;
            }
        }

        return output;
    }

    private _unsanitizeCommentsAndCDATA(xml: string): string {
        return xml.replace(new RegExp(MagicalStringOfWonders, "g"), "<");
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
