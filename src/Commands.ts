import * as vsc from "vscode";
import * as ext from "./Extension";
import * as xpath from "xpath";
import { RangeUtil } from "./utils/RangeUtil";
import { XmlFormatter } from "./services/XmlFormatter";
import { XPathFeatureProvider } from "./providers/XPath";
import { XQueryExecutionProvider } from "./providers/Execution";
import { XmlFormattingEditProvider } from "./providers/Formatting";

const CFG_SECTION: string = "xmlTools";
const CFG_REMOVE_COMMENTS: string = "removeCommentsOnMinify";

export class TextEditorCommands {
    static minifyXml(editor: vsc.TextEditor, edit: vsc.TextEditorEdit): void {
        let removeComments: boolean = vsc.workspace.getConfiguration(CFG_SECTION, editor.document.uri).get<boolean>(CFG_REMOVE_COMMENTS, false);
        
        let range: vsc.Range = RangeUtil.getRangeForDocument(editor.document);
        
        let formatter: XmlFormatter = new XmlFormatter();
        let xml: string = formatter.minify(editor.document.getText());
        
        edit.replace(range, xml);
    }
    
    static evaluateXPath(editor: vsc.TextEditor, edit: vsc.TextEditorEdit): void {
        XPathFeatureProvider.evaluateXPathAsync(editor, edit);
    }
    
    static executeXQuery(editor: vsc.TextEditor, edit: vsc.TextEditorEdit): void {
        XQueryExecutionProvider.executeXQueryAsync(editor);
    }

    static formatAsXml(editor: vsc.TextEditor, edit: vsc.TextEditorEdit): void {
        let edits: vsc.TextEdit[];
        let formattingEditProvider = new XmlFormattingEditProvider();
        let formattingOptions: vsc.FormattingOptions = {
            insertSpaces: (editor.options.insertSpaces as boolean),
            tabSize: (editor.options.tabSize as number)
        };
        
        // if the user has selected text, only format what is selected
        // otherwise, attempt to format the entire document
        if (!editor.selection.isEmpty) {
            edits = formattingEditProvider.provideDocumentRangeFormattingEdits(editor.document, editor.selection, formattingOptions); 
        }

        else {
            edits = formattingEditProvider.provideDocumentFormattingEdits(editor.document, formattingOptions);
        }

        if (edits) {
            for (let i = 0; i < edits.length; i++) {
                editor.edit(async (editBuilder) => {
                    editBuilder.replace(edits[i].range, edits[i].newText);

                    // wiggle the cursor to deselect the formatted XML (is there a non-hacky way to go about this?)
                    await vsc.commands.executeCommand("cursorMove", {
                        to: "left",
                        by: "character"
                    });
                    await vsc.commands.executeCommand("cursorMove", {
                        to: "right",
                        by: "character"
                    });
                });
            }
        }
    }
}