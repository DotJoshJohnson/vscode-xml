'use strict';

import { TextEditor, TextEditorEdit } from 'vscode';
import { getRangeForDocument } from '../utils/RangeUtils';

let pd = require('pretty-data').pd;

export function formatXml(editor: TextEditor, edit: TextEditorEdit): void {
	let current = editor.document.getText();
	let pretty = pd.xml(current);
	let range = getRangeForDocument(editor.document);

	edit.replace(range, pretty);
}

export function linearizeXml(editor: TextEditor, edit: TextEditorEdit): void {
	let current = editor.document.getText();
	let linear = pd.xmlmin(current);
	let range = getRangeForDocument(editor.document);
	
	edit.replace(range, linear);
}