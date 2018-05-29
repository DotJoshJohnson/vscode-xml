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

        it ("should preserve line breaks between elements", () => {
            testFormatter(xmlFormatter, options, "preserve-breaks");
        });

        it("should maintain comment formatting", () => {
            testFormatter(xmlFormatter, options, "maintain-comment-formatting");
        });

        it("should handle single-quotes in attributes", () => {
            testFormatter(xmlFormatter, options, "single-quotes");
        });

    });

});

function testFormatter(xmlFormatter: XmlFormatter, options: XmlFormattingOptions, fileLabel: string): void {
    const expectedFormattedXml = TestDataLoader.load(`${fileLabel}.formatted.xml`);
    const unformattedXml = TestDataLoader.load(`${fileLabel}.unformatted.xml`);

    const actualFormattedXml = xmlFormatter.formatXml(unformattedXml, options);

    assert.equal(actualFormattedXml, expectedFormattedXml, "Actual formatted XML does not match expected formatted XML.");
}
