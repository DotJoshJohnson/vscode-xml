import * as vsc from 'vscode';
import { ChildProcess } from '../services/ChildProcess';

const CFG_SECTION: string = 'xmlTools';
const CFG_XQEXEC: string = 'xqueryExecutionEngine';
const CFG_XQARGS: string = 'xqueryExecutionArguments';

export class XQueryExecutionProvider {
    static async executeXQueryAsync(editor: vsc.TextEditor): Promise<void> {
        // this disposable will be used for creating status bar messages
        let disposable: vsc.Disposable;
        
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
        
        let inputFile: vsc.Uri;
        disposable = vsc.window.setStatusBarMessage('Searching for XML files in folder...');
        let files: vsc.Uri[] = await vsc.workspace.findFiles('**/*.xml', '', 100);
        disposable.dispose();
        
        // user does not have a folder open - prompt for file name
        if (typeof files === 'undefined') {
            vsc.window.showErrorMessage('You must have a folder opened in VS Code to use this feature.');
            return;
        }
        
        // if there is only one XML file, default it
        // otherwise, prompt the user to select one from the open folder
        if (files.length > 1) {
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
            
            inputFile = selection.file;
        }
        
        else {
            inputFile = files[0];
        }
        
        // prompt for output file name
        let outputPath: string = null;
        let outputPathPos: number = -1;
        
        for (let i = 0; i < args.length; i++) {
            if (i > 0) {
                if (args[i - 1].search(/out|result/)) {
                    outputPath = args[i];
                    outputPathPos = i;
                }
            }
        }
        
        if (outputPath) {
            outputPath = await vsc.window.showInputBox({
                placeHolder: 'ex. C:\\TEMP\XQueryOutput\\MyOutputFile.xml',
                prompt: 'Please specify the output file path. Existing file behavior is determined by the execution engine you have specified.',
                value: outputPath
            });
            
            args[outputPathPos] = outputPath;
        }
        
        // call out to the execution engine
        disposable = vsc.window.setStatusBarMessage('Executing XQuery Script...');
        args = args.map<string>((value: string) => {
            return value
                .replace('$(script)', editor.document.uri.fsPath)
                .replace('$(input)', inputFile.fsPath)
                .replace('$(project)', vsc.workspace.rootPath);
        });
        
        try {
            await ChildProcess.spawnAsync(executable, args);
        }
        
        catch (error) {            
            if (error.message.search(/[Ll]ine:?\s*\d+/gm) > -1) {
                let match: RegExpExecArray = /[Ll]ine:?\s*\d+/gm.exec(error.message);
                let line: number = (Number.parseInt(match[0].replace(/([Ll]ine:?\s*)|\s/, '')) - 1);
                
                let selection: string = await vsc.window.showErrorMessage(error.message, `Go to Line ${line}`);
                
                if (selection == `Go to Line ${line}`) {
                    editor.revealRange(new vsc.Range(line, 0, line, 0));
                }
            }
            
            else {
                vsc.window.showErrorMessage(error.message);
            }
        }
        
        finally {
            disposable.dispose();
        }
    }
}