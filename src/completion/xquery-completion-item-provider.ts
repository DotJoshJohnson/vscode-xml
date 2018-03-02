import { CompletionItem, CompletionItemKind, CompletionItemProvider, Position, TextDocument } from "vscode";

const XQLint = require("xqlint").XQLint;

export class XQueryCompletionItemProvider implements CompletionItemProvider {

    provideCompletionItems(document: TextDocument, position: Position): CompletionItem[] {
        const completionItems = new Array<CompletionItem>();
        const linter = new XQLint(document.getText());

        linter.getCompletions({ line: position.line, col: position.character }).forEach((x: any) => {
            completionItems.push(this._getCompletionItem(x));
        });

        return completionItems;
    }

    private _getCompletionItem(xqLintCompletionItem: any): CompletionItem {
        const completionItem = new CompletionItem(xqLintCompletionItem.name);
        completionItem.insertText = xqLintCompletionItem.value;

        switch (xqLintCompletionItem.meta) {
            // functions (always qualified with a colon)
            case "function":
                completionItem.kind = CompletionItemKind.Function;

                const funcStart = (xqLintCompletionItem.value.indexOf(":") + 1);
                const funcEnd = xqLintCompletionItem.value.indexOf("(");

                completionItem.insertText = xqLintCompletionItem.value.substring(funcStart, funcEnd);
            break;

            // variables and parameters (always qualified with a dollar sign)
            case "Let binding":
            case "Local variable":
            case "Window variable":
            case "Function parameter":
                completionItem.kind = CompletionItemKind.Variable;
                completionItem.insertText = xqLintCompletionItem.value.substring(1);
            break;

            // everything else
            default:
                completionItem.kind = CompletionItemKind.Text;
            break;
        }

        return completionItem;
    }

}