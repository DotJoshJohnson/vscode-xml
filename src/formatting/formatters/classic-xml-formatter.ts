import { XmlFormatter } from "../xml-formatter";
import { XmlFormattingOptions } from "../xml-formatting-options";

export class ClassicXmlFormatter implements XmlFormatter {

    formatXml(xml: string, options: XmlFormattingOptions): string {
        xml = this.minifyXml(xml, options);
        xml = xml.replace(/</g, "~::~<");

        if (options.splitXmlnsOnFormat) {
            xml = xml
                .replace(/xmlns\:/g, "~::~xmlns:")
                .replace(/xmlns\=/g, "~::~xmlns=");
        }

        const parts: string[] = xml.split("~::~");
        let inComment = false;
        let level = 0;
        let output = "";

        for (let i = 0; i < parts.length; i++) {
            // <!
            if (parts[i].search(/<!/) > -1) {
                output += this._getIndent(options, level, parts[i]);
                inComment = true;

                // end <!
                if (parts[i].search(/-->/) > -1 || parts[i].search(/\]>/) > -1 || parts[i].search(/!DOCTYPE/) > -1) {
                    inComment = false;
                }
            } else if (parts[i].search(/-->/) > -1 || parts[i].search(/\]>/) > -1) {
                output += parts[i];
                inComment = false;
            } else if (/^<(\w|:)/.test(parts[i - 1]) && /^<\/(\w|:)/.test(parts[i])
                && /^<[\w:\-\.\,\/]+/.exec(parts[i - 1])[0] === /^<\/[\w:\-\.\,]+/.exec(parts[i])[0].replace("/", "")) {

                output += parts[i];
                if (!inComment) { level--; }
            } else if (parts[i].search(/<(\w|:)/) > -1 && parts[i].search(/<\//) === -1 && parts[i].search(/\/>/) === -1) {
                output = (!inComment) ? output += this._getIndent(options, level++, parts[i]) : output += parts[i];
            } else if (parts[i].search(/<(\w|:)/) > -1 && parts[i].search(/<\//) > -1) {
                output = (!inComment) ? output += this._getIndent(options, level, parts[i]) : output += parts[i];
            } else if (parts[i].search(/<\//) > -1) {
                output = (!inComment) ? output += this._getIndent(options, --level, parts[i]) : output += parts[i];
            } else if (parts[i].search(/\/>/) > -1 && (!options.splitXmlnsOnFormat || parts[i].search(/xmlns(:|=)/) === -1)) {
                output = (!inComment) ? output += this._getIndent(options, level, parts[i]) : output += parts[i];
            } else if (parts[i].search(/\/>/) > -1 && parts[i].search(/xmlns(:|=)/) > -1 && options.splitXmlnsOnFormat) {
                output = (!inComment) ? output += this._getIndent(options, level--, parts[i]) : output += parts[i];
            } else if (parts[i].search(/<\?/) > -1) {
                output += this._getIndent(options, level, parts[i]);
            } else if (options.splitXmlnsOnFormat && (parts[i].search(/xmlns\:/) > -1 || parts[i].search(/xmlns\=/) > -1)) {
                output += this._getIndent(options, level, parts[i]);
            } else {
                output += parts[i];
            }
        }

        // remove leading newline
        if (output[0] === options.newLine) {
            output = output.slice(1);
        } else if (output.substring(0, 1) === options.newLine) {
            output = output.slice(2);
        }

        return output;
    }

    minifyXml(xml: string, options: XmlFormattingOptions): string {
        xml = this._stripLineBreaks(options, xml); // all line breaks outside of CDATA elements and comments
        xml = (options.removeCommentsOnMinify) ? xml.replace(/\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/g, "") : xml;
        xml = xml.replace(/>\s{0,}</g, "><"); // insignificant whitespace between tags
        xml = xml.replace(/"\s+(?=[^\s]+=)/g, "\" "); // spaces between attributes
        xml = xml.replace(/"\s+(?=>)/g, "\""); // spaces between the last attribute and tag close (>)
        xml = xml.replace(/"\s+(?=\/>)/g, "\" "); // spaces between the last attribute and tag close (/>)
        xml = xml.replace(/[^ <>="]\s+[^ <>="]+=/g, (match: string) => { // spaces between the node name and the first attribute
            return match.replace(/\s+/g, " ");
        });

        return xml;
    }

    private _getIndent(options: XmlFormattingOptions, level: number, trailingValue?: string): string {
        trailingValue = trailingValue || "";

        const indentPattern = (options.editorOptions.preferSpaces) ? " ".repeat(options.editorOptions.tabSize) : "\t";

        return `${options.newLine}${indentPattern.repeat(level)}${trailingValue}`;
    }

    /**
     * Removes line breaks outside of CDATA, comment, and xml:space="preserve" blocks.
     */
    private _stripLineBreaks(options: XmlFormattingOptions, xml: string): string {
        let output = "";
        const inTag = false;
        const inTagName = false;
        let inCdataOrComment = false;
        const inAttribute = false;

        let preserveSpace = false;
        let level = 0;
        let levelpreserveSpaceActivated = 0;

        for (let i = 0; i < xml.length; i++) {
            const char: string = xml.charAt(i);
            const prev: string = xml.charAt(i - 1);
            const next: string = xml.charAt(i + 1);

            // CDATA and comments
            if (char === "!" && (xml.substr(i, 8) === "![CDATA[" || xml.substr(i, 3) === "!--")) {
                inCdataOrComment = true;
            }

            else if (char === "]" && (xml.substr(i, 3) === "]]>")) {
                inCdataOrComment = false;
            }

            else if (char === "-" && (xml.substr(i, 3) === "-->")) {
                inCdataOrComment = false;
            }

            // xml:space="preserve"
            if (char === ">" && prev !== "/") {
                level++;
            }

            else if (!inCdataOrComment && char === "/" && (prev === "<" || next === ">")) {
                level--;
            }

            if (char === "x" && (xml.substr(i, 20).toLowerCase() === `xml:space="preserve"`)) {
                preserveSpace = true;
                levelpreserveSpaceActivated = level;
            }

            else if (!inCdataOrComment && preserveSpace && (char === "/" && (prev === "<" || next === ">")) && (level === levelpreserveSpaceActivated)) {
                preserveSpace = false;
            }

            if (char.search(/[\r\n]/g) > -1 && !inCdataOrComment && !preserveSpace) {
                if (/\r/.test(char) && /\S|\r|\n/.test(prev) && /\S|\r|\n/.test(xml.charAt(i + options.newLine.length))) {
                    output += char;
                }

                else if (/\n/.test(char) && /\S|\r|\n/.test(xml.charAt(i - options.newLine.length)) && /\S|\r|\n/.test(next)) {
                    output += char;
                }

                continue;
            }

            output += char;
        }

        return output;
    }
}
