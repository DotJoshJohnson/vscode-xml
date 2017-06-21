import * as vsc from 'vscode';

export class RangeUtil {
    static getRangeForDocument(document: vsc.TextDocument): vsc.Range {
	   let lastLineIndex = (document.lineCount - 1);
	   let range = new vsc.Range(new vsc.Position(0, 0), new vsc.Position(lastLineIndex, Number.MAX_VALUE));

	   range = document.validateRange(range);
	   return range;
    }
}