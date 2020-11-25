import * as assert from "assert";
import { FormattingOptions } from "vscode";

import { TestDataLoader } from "./test-utils/test-data-loader";

import { XmlFormatter, XmlFormattingOptions } from "../formatting";
import { V2XmlFormatter } from "../formatting/formatters";

describe("V2XmlFormatter", () => {

    const xmlFormatter = new V2XmlFormatter();

    describe("#formatXml(xml, options)", () => {

        const options = {
            editorOptions: {
                insertSpaces: true,
                tabSize: 4
            },
            enforcePrettySelfClosingTagOnFormat: false,
            newLine: "\r\n",
            removeCommentsOnMinify: false,
            splitAttributesOnFormat: false,
            splitXmlnsOnFormat: true
        };

        it("should handle basic XML", () => {
            testFormatter(xmlFormatter, options, "basic");
        });

        it("should handle unicode element names", () => {
            testFormatter(xmlFormatter, options, "unicode");
        });

        it("should handle self-closing elements", () => {
            testFormatter(xmlFormatter, options, "self-closing");
        });

        it("should handle text-only lines", () => {
            testFormatter(xmlFormatter, options, "text-only-line");
        });

        it("should handle preformatted xml", () => {
            testFormatter(xmlFormatter, options, "preformatted");
        });

        it("should preserve line breaks between elements", () => {
            testFormatter(xmlFormatter, options, "preserve-breaks");
        });

        it("should maintain comment formatting", () => {
            testFormatter(xmlFormatter, options, "maintain-comment-formatting");
        });

        it("should handle single-quotes in attributes", () => {
            testFormatter(xmlFormatter, options, "single-quotes");
        });

        it("should not add extra line breaks before start tags", () => {
            testFormatter(xmlFormatter, options, "issue-178");
        });

        it("should allow users to enforce space before self-closing tag slash", () => {
            options.enforcePrettySelfClosingTagOnFormat = true;

            testFormatter(xmlFormatter, options, "issue-149");

            options.enforcePrettySelfClosingTagOnFormat = false;
        });

        it("should properly format closing tag after self-closing tag", () => {
            testFormatter(xmlFormatter, options, "issue-185");
        });

        it("should support single quotes within double-quoptes attributes and vice-versa", () => {
            testFormatter(xmlFormatter, options, "issue-187");
        });

        it("should not ruin attributes with unusual characters", () => {
            testFormatter(xmlFormatter, options, "issue-189");
        });

        it("should not add extra line breaks before closing tags", () => {
            testFormatter(xmlFormatter, options, "issue-193");
        });

        it("should not add extra whitespace before CDATA", () => {
            testFormatter(xmlFormatter, options, "issue-194");
        });

        it("should support mixed content", () => {
            testFormatter(xmlFormatter, options, "issue-200");
        });

        it("should not remove spaces between the node name and the first attribute within CDATA", () => {
            testFormatter(xmlFormatter, options, "issue-227");
        });

        it("should handle mixed content as a child of another element", () => {
            testFormatter(xmlFormatter, options, "issue-257");
        });

        it("should not touch CDATA content", () => {
            testFormatter(xmlFormatter, options, "issue-293");
        });

        it("should not add trailing whitespace", () => {
            testFormatter(xmlFormatter, options, "issue-288");
        });

        it("should handle mixed content on the same line as another element without error", () => {
            testFormatter(xmlFormatter, options, "issue-294");
        });
    });

    describe("#minifyXml(xml, options)", () => {

        const options = {
            editorOptions: {
                insertSpaces: true,
                tabSize: 4
            },
            enforcePrettySelfClosingTagOnFormat: false,
            newLine: "\r\n",
            removeCommentsOnMinify: false,
            splitAttributesOnFormat: false,
            splitXmlnsOnFormat: true
        };

        it("should preserve whitespace on minify if xml:space is set to 'preserve-whitespace'", () => {
            testMinifier(xmlFormatter, options, "issue-262");
        });

    });

});

function testFormatter(xmlFormatter: XmlFormatter, options: XmlFormattingOptions, fileLabel: string): void {
    const expectedFormattedXml = TestDataLoader.load(`${fileLabel}.formatted.xml`).replace(/\r/g, "");
    const unformattedXml = TestDataLoader.load(`${fileLabel}.unformatted.xml`);

    const actualFormattedXml = xmlFormatter.formatXml(unformattedXml, options).replace(/\r/g, "");

    // tslint:disable-next-line
    assert.ok((actualFormattedXml === expectedFormattedXml), `Actual formatted XML does not match expected formatted XML.\n\nACTUAL\n${actualFormattedXml.replace(/\s/g, "~ws~")}\n\nEXPECTED\n${expectedFormattedXml.replace(/\s/g, "~ws~")}`);
}

function testMinifier(xmlFormatter: XmlFormatter, options: XmlFormattingOptions, fileLabel: string): void {
    const expectedMinifiedXml = TestDataLoader.load(`${fileLabel}.minified.xml`).replace(/\r/g, "");
    const unminifiedXml = TestDataLoader.load(`${fileLabel}.unminified.xml`);

    const actualMinifiedXml = xmlFormatter.minifyXml(unminifiedXml, options).replace(/\r/g, "");

    // tslint:disable-next-line
    assert.ok((actualMinifiedXml === expectedMinifiedXml), `Actual minified XML does not match expected minified XML.\n\nACTUAL\n${actualMinifiedXml.replace(/\s/g, "~ws~")}\n\nEXPECTED\n${expectedMinifiedXml.replace(/\s/g, "~ws~")}`);
}
