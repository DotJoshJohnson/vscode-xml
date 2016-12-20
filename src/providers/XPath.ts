'use strict';

import * as vsc from 'vscode';
import * as ext from '../Extension';
import { XPathEvaluator, EvaluatorResult, EvaluatorResultType } from '../services/XPathEvaluator';

const CFG_SECTION: string = 'xmlTools';
const CFG_PERSIST_QUERY: string = 'persistXPathQuery';
const CFG_IGNORE_DEFAULT_XMLNS: string = 'ignoreDefaultNamespace';
const MEM_QUERY_HISTORY: string = 'xpathQueryHistory';
const MEM_QUERY_LAST: string = 'xPathQueryLast';
const OUTPUT_CHANNEL: string = 'XPath Results';

export class XPathFeatureProvider {
    static async evaluateXPathAsync(editor: vsc.TextEditor, edit: vsc.TextEditorEdit): Promise<void> {
        // if there is no workspace, we will track queries in the global Memento
        let memento: vsc.Memento = ext.WorkspaceState || ext.GlobalState;
        
        // get the xpath persistence setting
        let persistQueries: boolean = vsc.workspace.getConfiguration(CFG_SECTION).get<boolean>(CFG_PERSIST_QUERY, true);
        
        // get the last query if there is one for this document
        // if not, try pulling the last query ran, regardless of document
        // NOTE: if the user has focus on the output channel when opening the xquery prompt, the channel is the "active" document
        let history: HistoricQuery[] = memento.get<HistoricQuery[]>(MEM_QUERY_HISTORY, new Array<HistoricQuery>());
        let globalLastQuery: string = memento.get<string>(MEM_QUERY_LAST, '');

        let lastQuery: HistoricQuery = history.find((item: HistoricQuery) => {
            if (item.uri == editor.document.uri.toString()) {
                return true;
            }

            return false;
        });

        // set the inital display value and prompt the user
        let query: string = '';
        
        if (persistQueries) {
            if (lastQuery) {
                query = lastQuery.query;
            }
            
            else {
                query = globalLastQuery;
            }
        }

        query = await vsc.window.showInputBox({
            placeHolder: 'XPath Query',
            prompt: 'Please enter an XPath query to evaluate.',
            value: query
        });
        
        // showInputBox() will return undefined if the user dimissed the prompt
        if (query) {
            
            let ignoreDefaultNamespace: boolean = vsc.workspace.getConfiguration(CFG_SECTION).get<boolean>(CFG_IGNORE_DEFAULT_XMLNS, true);
            
            // run the query
            let xml: string = editor.document.getText();
            let evalResult: EvaluatorResult;
            
            try {
                evalResult = XPathEvaluator.evaluate(query, xml, ignoreDefaultNamespace);
            }
            catch (error) {
                console.error(error);
                vsc.window.showErrorMessage(`Something went wrong while evaluating the XPath: ${error}`);
                return;
            }
            
            // show the results to the user
            let outputChannel: vsc.OutputChannel = vsc.window.createOutputChannel(OUTPUT_CHANNEL);
            outputChannel.clear();

            outputChannel.appendLine(`XPath Query: ${query}`);
            outputChannel.append('\n');
            
            if (evalResult.type === EvaluatorResultType.NODE_COLLECTION) {
                (evalResult.result as Node[]).forEach((node: XmlNode) => {
                    outputChannel.appendLine(`[Line ${node.lineNumber}] ${node.localName}: ${node.textContent}`);
                });
            } else {    
                outputChannel.appendLine(`[Result]: ${evalResult.result}`);
            }
            outputChannel.show(vsc.ViewColumn.Three);
            
            // if persistence is enabled, save the query for later
            if (persistQueries) {
                lastQuery = new HistoricQuery(editor.document.uri.toString(), query);

                let affectedIndex: number = -1;
                history = history.map<HistoricQuery>((item: HistoricQuery, index: number) => {
                    if (item.uri == lastQuery.uri) {
                        item.query = query;
                        affectedIndex = index;
                    }
                    
                    return item;
                });

                if (affectedIndex == -1) {
                    history.push(lastQuery);
                }

                memento.update(MEM_QUERY_HISTORY, history);
                memento.update(MEM_QUERY_LAST, query);
            }
        }
    }
}

class HistoricQuery {
    constructor(uri: string, query: string) {
        this.uri = uri;
        this.query = query;
    }
    
    uri: string;
    query: string;
}