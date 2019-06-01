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
    });

});

function testFormatter(xmlFormatter: XmlFormatter, options: XmlFormattingOptions, fileLabel: string): void {
    const expectedFormattedXml = TestDataLoader.load(`${fileLabel}.formatted.xml`);
    const unformattedXml = TestDataLoader.load(`${fileLabel}.unformatted.xml`);

    const actualFormattedXml = xmlFormatter.formatXml(unformattedXml, options);

    assert.equal(actualFormattedXml, expectedFormattedXml, "Actual formatted XML does not match expected formatted XML.");
}
