import { window } from "vscode";
import { TextEditor, TextEditorEdit, ViewColumn } from "vscode";

import { Configuration, ExtensionState } from "../../common";
import * as constants from "../../constants";

import { EvaluatorResult, EvaluatorResultType, XPathEvaluator } from "../xpath-evaluator";

class HistoricQuery {
    constructor(uri: string, query: string) {
        this.uri = uri;
        this.query = query;
    }

    uri: string;
    query: string;
}

export async function evaluateXPath(editor: TextEditor, edit: TextEditorEdit): Promise<void> {
    // if there is no workspace, we will track queries in the global Memento
    const memento = ExtensionState.workspace || ExtensionState.global;

    // get the xpath persistence setting
    const persistQueries = Configuration.xpathRememberLastQuery;

    // get the last query if there is one for this document
    // if not, try pulling the last query ran, regardless of document
    // NOTE: if the user has focus on the output channel when opening the xquery prompt, the channel is the "active" document
    const history = memento.get<HistoricQuery[]>(constants.stateKeys.xpathQueryHistory, new Array<HistoricQuery>());
    const globalLastQuery = memento.get<string>(constants.stateKeys.xPathQueryLast, "");

    const lastQuery = history.find(x => {
        return (x.uri === editor.document.uri.toString());
    });

    // set the inital display value and prompt the user
    let query = (lastQuery) ? lastQuery.query : globalLastQuery;

    query = await window.showInputBox({
        placeHolder: "XPath Query",
        prompt: "Please enter an XPath query to evaluate.",
        value: query
    });

    // showInputBox() will return undefined if the user dimissed the prompt
    if (!query) {
        return;
    }

    const ignoreDefaultNamespace = Configuration.xpathIgnoreDefaultNamespace;

    // run the query
    const xml = editor.document.getText();
    let evalResult: EvaluatorResult;

    try {
        evalResult = XPathEvaluator.evaluate(query, xml, ignoreDefaultNamespace);
    }

    catch (error) {
        console.error(error);
        window.showErrorMessage(`Something went wrong while evaluating the XPath: ${error}`);
        return;
    }

    // show the results to the user
    const outputChannel = window.createOutputChannel("XPath Results");

    outputChannel.clear();

    outputChannel.appendLine(`XPath Query: ${query}`);
    outputChannel.append("\n");

    if (evalResult.type === EvaluatorResultType.NODE_COLLECTION) {
        (evalResult.result as Node[]).forEach((node: any) => {
            outputChannel.appendLine(`[Line ${node.lineNumber}] ${node.localName}: ${node.textContent}`);
        });
    }

    else {
        outputChannel.appendLine(`[Result]: ${evalResult.result}`);
    }

    outputChannel.show(false);

    if (persistQueries) {
        const historicQuery = new HistoricQuery(editor.document.uri.toString(), query);

        const affectedIndex = history.findIndex(x => x.uri === historicQuery.uri);

        if (affectedIndex === -1) {
            history.push(historicQuery);
        }

        else {
            history[affectedIndex].query = query;
        }

        memento.update(constants.stateKeys.xpathQueryHistory, history);
        memento.update(constants.stateKeys.xPathQueryLast, query);
    }
}
