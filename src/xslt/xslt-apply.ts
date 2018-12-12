import { readFileSync } from "fs";
import { window, workspace, ViewColumn } from "vscode";
import { XSLTTransform } from "./xslt-transform";

export async function runXSLTTransform () {
    const xsltFile = await window.showOpenDialog(
        {
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            filters: {
                "XSLT" : ["xsl", "xslt"]
            }
        }
    );
    if (window.activeTextEditor !== undefined && xsltFile !== undefined) {
        const xml = window.activeTextEditor.document.getText();
        const xslt = readFileSync(xsltFile[0].fsPath).toString();
        try {
            const result = new XSLTTransform(xml, xslt).apply();
            const textDoc = await workspace.openTextDocument({
                    content: result,
                    language: "xml"
            });

            window.showTextDocument(textDoc, ViewColumn.Beside);

            const web = window.createWebviewPanel("transformPreview", "XSLT Results", ViewColumn.Beside, { });
            web.webview.html = result;

        }
        catch (e) {
            window.showErrorMessage(e);
        }
    }
    else {
        window.showErrorMessage("An error occurred while accessing the XML and/or XSLT source files.");
    }
}
