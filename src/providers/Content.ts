'use strict';

import * as vsc from 'vscode';
import { XmlTreeService } from '../services/XmlTreeService';

export class XmlTreeDocumentContentProvider implements vsc.TextDocumentContentProvider {
    
    static get SCHEME(): string {
        return "xmltree";
    }
    
    static buildUri(sourceUri: vsc.Uri): vsc.Uri {
        let uriStr: string = `xmltree://${encodeURIComponent(sourceUri.toString())}`;
        
        let uri: vsc.Uri = vsc.Uri.parse(uriStr);
        
        return uri;
    }
    
    async provideTextDocumentContent(uri: vsc.Uri): Promise<string> {
        let sourceUri: vsc.Uri = vsc.Uri.parse(decodeURIComponent(uri.toString().substr(10)));
        let document: vsc.TextDocument = await vsc.workspace.openTextDocument(sourceUri);
        
        let html: string = XmlTreeService.getXmlTreeHtml(document.getText());
        
        return Promise.resolve(html);
    }
}