import * as vsc from 'vscode';
import { RangeUtil } from '../utils/RangeUtil';
import { XmlFormatter, IXmlFormatterOptions } from '../services/XmlFormatter';

const CFG_SECTION: string = 'xmlTools';
const CFG_SPLIT_NAMESPACES: string = 'splitXmlnsOnFormat';

export class XmlFormattingEditProvider implements vsc.DocumentFormattingEditProvider, vsc.DocumentRangeFormattingEditProvider {
    provideDocumentFormattingEdits(document: vsc.TextDocument, options: vsc.FormattingOptions): vsc.TextEdit[] {
        let range = RangeUtil.getRangeForDocument(document);
        
        return this._provideFormattingEdits(document, range, options);
    }
    
    provideDocumentRangeFormattingEdits(document: vsc.TextDocument, range: vsc.Range, options: vsc.FormattingOptions): vsc.TextEdit[] {
        return this._provideFormattingEdits(document, range, options);
    }
    
    private _provideFormattingEdits(document: vsc.TextDocument, range: vsc.Range, options: vsc.FormattingOptions): vsc.TextEdit[] {
        let splitNamespaces: boolean = vsc.workspace.getConfiguration(CFG_SECTION).get<boolean>(CFG_SPLIT_NAMESPACES, true);
        
        let formatterOptions: IXmlFormatterOptions = {
            preferSpaces: options.insertSpaces,
            tabSize: options.tabSize,
            splitNamespaces: splitNamespaces
        };
        
        let formatter = new XmlFormatter(formatterOptions);
        let xml = formatter.format(document.getText(range));
        
        return [ vsc.TextEdit.replace(range, xml) ];
    }
}