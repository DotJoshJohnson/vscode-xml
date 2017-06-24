import * as vsc from "vscode";
import { XQueryCompleter, XQueryCompletionItem } from "../services/XQueryCompleter";

export class XQueryCompletionItemProvider implements vsc.CompletionItemProvider {
    provideCompletionItems(document: vsc.TextDocument, position: vsc.Position): vsc.CompletionItem[] {
        let items: vsc.CompletionItem[] = new Array<vsc.CompletionItem>();
        
        let completer: XQueryCompleter = new XQueryCompleter(document.getText());
        let completions: XQueryCompletionItem[] = completer.getCompletions(position.line, position.character);
        
        completions.forEach((completion: XQueryCompletionItem) => {
            let item: vsc.CompletionItem = new vsc.CompletionItem(completion.name);
            item.insertText = completion.value;
            
            switch (completion.meta) {
                // functions (always qualified with a colon)
                case "function":
                    item.kind = vsc.CompletionItemKind.Function;
                    
                    let funcStart = (completion.value.indexOf(":") + 1);
                    let funcEnd = completion.value.indexOf("(");
                    
                    item.insertText = completion.value.substring(funcStart, funcEnd);
                    break;
                    
                // variables and parameters (always qualified with a dollar sign)
                case "Let binding":
				case "Local variable":
				case "Window variable":
				case "Function parameter":
                    item.kind = vsc.CompletionItemKind.Variable;
                    item.insertText = completion.value.substring(1);
                    break;
                    
                // everything else
                default: item.kind = vsc.CompletionItemKind.Text;
            }
            
            items.push(item);
        });
        
        return items;
    }
}