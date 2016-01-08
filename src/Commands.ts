'use strict';

import * as vsc from 'vscode';
import * as ext from './Extension';
import * as xpath from 'xpath';
import { RangeUtil } from './utils/RangeUtil';
import { XmlFormatter } from './services/XmlFormatter';
import { XPathFeatureProvider } from './providers/XPath';
import { XQueryExecutionProvider } from './providers/Execution';

const CFG_SECTION: string = 'xmlTools';
const CFG_REMOVE_COMMENTS: string = 'removeCommentsOnMinify';

export class TextEditorCommands {
    static formatXml(editor: vsc.TextEditor, edit: vsc.TextEditorEdit): void {
        // alias for editor.action.format
        vsc.commands.executeCommand('editor.action.format');
    }
    
    static minifyXml(editor: vsc.TextEditor, edit: vsc.TextEditorEdit): void {
        let removeComments: boolean = vsc.workspace.getConfiguration(CFG_SECTION).get<boolean>(CFG_REMOVE_COMMENTS, false);
        
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
}