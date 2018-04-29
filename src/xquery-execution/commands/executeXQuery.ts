import { commands, window, workspace } from "vscode";
import { Disposable, Range, TextEditor, TextEditorEdit, Uri } from "vscode";

import * as constants from "../../constants";

import { ChildProcess } from "../child-process";

export async function executeXQuery(editor: TextEditor, edit: TextEditorEdit): Promise<void> {
    const config = workspace.getConfiguration(constants.extensionPrefix);

    // this disposable will be used for creating status bar messages
    let disposable: Disposable;

    if (editor.document.languageId !== constants.languageIds.xquery) {
        window.showErrorMessage("This action can only be performed on an XQuery file.");
        return;
    }

    const executable = config.get<string>(constants.configKeys.xqueryExecutionEngine, null);
    let args = config.get<string[]>(constants.configKeys.xqueryExecutionArguments, []);

    if (!executable || executable === "") {
        const action = await window.showWarningMessage("An XQuery execution engine has not been defined.", "Define Now");

        if (action === "Define Now") {
            commands.executeCommand(constants.nativeCommands.openGlobalSettings);
        }

        return;
    }

    let inputFile: Uri;
    disposable = window.setStatusBarMessage("Searching for XML files in folder...");

    const searchPattern = config.get<string>(constants.configKeys.xqueryExecutionInputSearchPattern);
    const inputLimit = config.get<number>(constants.configKeys.xqueryExecutionInputLimit);

    const files = await workspace.findFiles(searchPattern, "", inputLimit);

    disposable.dispose();

    // user does not have a folder open - prompt for file name
    if (typeof files === "undefined") {
        window.showErrorMessage("You must have a folder opened in VS Code to use this feature.");
        return;
    }

    // if there is only one XML file, default it
    // otherwise, prompt the user to select one from the open folder
    if (files.length > 1) {
        const qpItems = new Array<any>();

        files.forEach((file) => {
            const filename = file.fsPath.replace("\\", "/");

            qpItems.push({ // must implement vscode.QuickPickItem
                label: filename.substring(filename.lastIndexOf("/") + 1),
                description: file.fsPath,
                file: file
            });
        });

        const selection = await window.showQuickPick(qpItems, { placeHolder: "Please select an input file." });

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
    let outputPathPos = -1;

    for (let i = 0; i < args.length; i++) {
        if (i > 0) {
            if (args[i - 1].search(/out|result/)) {
                outputPath = args[i];
                outputPathPos = i;
            }
        }
    }

    if (outputPath) {
        outputPath = await window.showInputBox({
            placeHolder: "ex. C:\\TEMP\XQueryOutput\\MyOutputFile.xml",
            prompt: "Please specify the output file path. Existing file behavior is determined by the execution engine you have specified.",
            value: outputPath
        });

        args[outputPathPos] = outputPath;
    }

    // call out to the execution engine
    disposable = window.setStatusBarMessage("Executing XQuery Script...");
    args = args.map<string>((value: string) => {
        return value
            .replace("$(script)", editor.document.uri.fsPath)
            .replace("$(input)", inputFile.fsPath)
            .replace("$(project)", workspace.rootPath);
    });

    try {
        await ChildProcess.spawn(executable, args);
    }

    catch (error) {
        if (error.message.search(/[Ll]ine:?\s*\d+/gm) > -1) {
            const match: RegExpExecArray = /[Ll]ine:?\s*\d+/gm.exec(error.message);
            const line: number = (Number.parseInt(match[0].replace(/([Ll]ine:?\s*)|\s/, "")) - 1);

            const selection: string = await window.showErrorMessage(error.message, `Go to Line ${line}`);

            if (selection === `Go to Line ${line}`) {
                editor.revealRange(new Range(line, 0, line, 0));
            }
        }

        else {
            window.showErrorMessage(error.message);
        }
    }

    finally {
        disposable.dispose();
    }
}
