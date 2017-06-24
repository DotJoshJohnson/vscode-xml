import * as vsc from "vscode";
import { XQueryLinter, XQueryDiagnostic } from "../services/XQueryLinter";

export class XQueryLintingFeatureProvider {
    private static _coreDiagnostics: vsc.DiagnosticCollection;
    
    static get coreDiagnostics(): vsc.DiagnosticCollection {
        if (!XQueryLintingFeatureProvider._coreDiagnostics) {
            XQueryLintingFeatureProvider._coreDiagnostics = vsc.languages.createDiagnosticCollection("XQueryDiagnostics");
        }
        
        return XQueryLintingFeatureProvider._coreDiagnostics;
    }
    
    static provideXQueryDiagnostics(editor: vsc.TextEditor): void {
        let diagnostics: vsc.Diagnostic[] = new Array<vsc.Diagnostic>();
        let xqDiagnostics: XQueryDiagnostic[] = XQueryLinter.lint(editor.document.getText());
        
        xqDiagnostics.forEach((xqd: XQueryDiagnostic) => {
            let vSeverity: vsc.DiagnosticSeverity = (xqd.severity == 1) ? vsc.DiagnosticSeverity.Warning : vsc.DiagnosticSeverity.Error;
            
            let startPos: vsc.Position = new vsc.Position(xqd.startLine, xqd.startColumn);
            let endPos: vsc.Position = new vsc.Position(xqd.endLine, xqd.endColumn);
            let range: vsc.Range = new vsc.Range(startPos, endPos);
            let diagnostic: vsc.Diagnostic = new vsc.Diagnostic(range, xqd.message, vSeverity);
            
            diagnostics.push(diagnostic);
        });
        
        XQueryLintingFeatureProvider.coreDiagnostics.set(editor.document.uri, diagnostics);
    }
}