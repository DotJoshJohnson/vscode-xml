'use strict';

import { TextEditor, TextEditorEdit, TextDocument, Position, Range } from 'vscode';

let pd = require('pretty-data').pd;

export function formatXml(editor: TextEditor, edit: TextEditorEdit): void {
	let current = editor.document.getText();
	let pretty = pd.xml(current);
	
	// get the range for the entire document
	let lastLineIndex = (editor.document.lineCount - 1);
	let lastLine = editor.document.lineAt(lastLineIndex);
	let lastPosition = lastLine.rangeIncludingLineBreak.end;
	let range = new Range(new Position(0, 0), lastPosition);
	
	// validate the range to ensure it fits inside the document
	range = editor.document.validateRange(range);
	
	// replace the existing xml with the pretty xml
	edit.replace(range, pretty);
}