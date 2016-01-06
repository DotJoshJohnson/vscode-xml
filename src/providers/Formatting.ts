'use strict';

import * as vsc from 'vscode';
import { RangeUtil } from '../utils/RangeUtil';
import { XmlFormatter } from '../services/XmlFormatter';

export class XmlDocumentFormattingEditProvider implements vsc.DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(document: vsc.TextDocument, options: vsc.FormattingOptions): vsc.TextEdit[] {
        let range = RangeUtil.getRangeForDocument(document);
        let formatter = new XmlFormatter(options.insertSpaces, options.tabSize);
        let xml = formatter.format(document.getText());
        
        return [ vsc.TextEdit.replace(range, xml) ];
    }
}

export class XmlRangeFormattingEditProvider implements vsc.DocumentRangeFormattingEditProvider {
    provideDocumentRangeFormattingEdits(document: vsc.TextDocument, range: vsc.Range, options: vsc.FormattingOptions): vsc.TextEdit[] {
        let formatter = new XmlFormatter(options.insertSpaces, options.tabSize);
        let xml = formatter.format(document.getText());
        
        return [ vsc.TextEdit.replace(range, xml) ];
    }
}