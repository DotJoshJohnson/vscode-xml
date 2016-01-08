'use strict';

import * as vsc from 'vscode';
import { ChildProcess } from '../services/ChildProcess';

const CFG_SECTION: string = 'xmlTools';
const CFG_XQEXEC: string = 'xqueryExecutionEngine';
const CFG_XQARGS: string = 'xqueryExecutionArguments';

export class XQueryExecutionProvider {
    static async executeXQueryAsync(editor: vsc.TextEditor): Promise<void> {
        if (editor.document.languageId !== 'xquery') {
            vsc.window.showErrorMessage('This action can only be performed on an XQuery file.');
            return;
        }
        
        let executable = vsc.workspace.getConfiguration(CFG_SECTION).get<string>(CFG_XQEXEC, null);
        let args = vsc.workspace.getConfiguration(CFG_SECTION).get<string[]>(CFG_XQARGS, []);
        
        if (!executable || executable == '') {
            let action = await vsc.window.showWarningMessage('An XQuery execution engine has not been defined.', 'Define Now');
            
            if (action == 'Define Now') {
                vsc.commands.executeCommand('workbench.action.openGlobalSettings');
            }
            
            return;
        }
        
        let files: vsc.Uri[] = await vsc.workspace.findFiles('**/*.xml', '', 100);
        
        let qpItems: any[] = new Array<any>();
        
        files.forEach((file) => {
            let filename: string = file.fsPath.replace('\\', '/');
            
            qpItems.push({ // must implement vscode.QuickPickItem
                label: filename.substring(filename.lastIndexOf('/') + 1),
                description: file.fsPath,
                file: file
            });
        });
        
        let selection = await vsc.window.showQuickPick(qpItems, { placeHolder: 'Please select an input file.' });
        
        if (!selection) {
            return;
        }
        
        let disposable: vsc.Disposable = vsc.window.setStatusBarMessage('Executing XQuery Script...');
        args = args.map<string>((value: string) => {
            return value
                .replace('$(script)', editor.document.uri.fsPath)
                .replace('$(input)', selection.file.fsPath);
        });
        await ChildProcess.spawnAsync(executable, args);
        disposable.dispose();
    }
}