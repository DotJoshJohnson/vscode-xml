import { Diagnostic, DiagnosticSeverity, Position, Range } from "vscode";

const XQLint = require("xqlint").XQLint;

export class XQueryLinter {
    static SEVERITY_WARNING = 1;
    static SEVERITY_ERROR = 2;

    lint(text: string): Diagnostic[] {
        const linter = new XQLint(text);
        const diagnostics = new Array<Diagnostic>();

        linter.getErrors().forEach((error: any) => {
            diagnostics.push(new Diagnostic(
                new Range(
                    new Position(error.pos.sl, error.pos.sc),
                    new Position(error.pos.el, error.pos.ec)
                ),
                error.message,
                DiagnosticSeverity.Error
            ));
        });

        linter.getWarnings().forEach((warning: any) => {
            diagnostics.push(new Diagnostic(
                new Range(
                    new Position(warning.pos.sl, warning.pos.sc),
                    new Position(warning.pos.el, warning.pos.ec)
                ),
                warning.message,
                DiagnosticSeverity.Warning
            ));
        });

        return diagnostics;
    }
}
