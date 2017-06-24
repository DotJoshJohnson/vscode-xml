let XQLint = require("xqlint").XQLint;

export class XQueryLinter {
    static SEVERITY_WARNING: number = 1;
    static SEVERITY_ERROR: number = 2;
    
    static lint(text: string): XQueryDiagnostic[] {
        let linter = new XQLint(text);
        let diagnostics: XQueryDiagnostic[] = new Array<XQueryDiagnostic>();
        
        linter.getErrors().forEach((error: any) => {
            diagnostics.push(new XQueryDiagnostic(XQueryLinter.SEVERITY_ERROR, error.message, error.pos.sl, error.pos.sc, error.pos.el, error.pos.ec));
        });
        
        linter.getWarnings().forEach((warning: any) => {
            diagnostics.push(new XQueryDiagnostic(XQueryLinter.SEVERITY_WARNING, warning.message, warning.pos.sl, warning.pos.sc, warning.pos.el, warning.pos.ec));
        });
        
        return diagnostics;
    }
}

export class XQueryDiagnostic {
    constructor(severity: number, message: string, startLine: number, startColumn: number, endLine: number, endColumn: number) {
        this.severity = severity;
        this.message = message;
        this.startLine = startLine;
        this.startColumn = startColumn;
        this.endLine = endLine;
        this.endColumn = endColumn;
    }
    
    severity: number;
    message: string;
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
}