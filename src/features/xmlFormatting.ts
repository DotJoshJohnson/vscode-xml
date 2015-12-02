'use strict';

import {
Range,
TextEdit,
TextEditor,
TextDocument,
TextEditorEdit,
CancellationToken,
FormattingOptions,
DocumentFormattingEditProvider,
DocumentRangeFormattingEditProvider
} from 'vscode';

import { getRangeForDocument } from '../utils/RangeUtils';

export function linearizeXml(editor: TextEditor, edit: TextEditorEdit): void {
	let current = editor.document.getText();
	let range = getRangeForDocument(editor.document);

	edit.replace(range, _linearizeXml(current));
}

export class XmlDocumentFormattingProvider implements DocumentFormattingEditProvider {
	provideDocumentFormattingEdits(document: TextDocument, options: FormattingOptions, token: CancellationToken): TextEdit[] {
		let current = document.getText();
		let range = getRangeForDocument(document);

		return [TextEdit.replace(range, _formatXml(current, options))];
	}
}

export class XmlRangeFormattingProvider implements DocumentRangeFormattingEditProvider {
	provideDocumentRangeFormattingEdits(document: TextDocument, range: Range, options: FormattingOptions, token: CancellationToken): TextEdit[] {
		let current = document.getText(range);

		return [TextEdit.replace(range, _formatXml(current, options))];
	}
}

function _strRepeat(source: string, count: number): string {
	let output = '';
	
	for (let i = 0; i < count; i++) {
		output += source;
	}
	
	return output;
}

function _linearizeXml(xml: string): string {
	return xml.replace(/>\s{0,}</g, '><');
}

function _formatXml(xml: string, options: FormattingOptions): string {
	let tab = _strRepeat(' ', options.tabSize);
	let output = '';
	let level = 0;
	
	// linearize the xml first for a consistent starting point
	xml = _linearizeXml(xml);
	
	// put each tag on its own line
	xml = xml.replace(/></g, '>\n<');
	
	// iterate over each line and plug in tabs
	let tokens = xml.split('\n');
	for (let i = 0; i < tokens.length; i++) {
		let line = tokens[i];
		
		// start tags
		let startMatch = /<[\w\d]+[^\/]*>/.exec(line);
		if (startMatch !== null && startMatch[0] == line) {
			output += _strRepeat(tab, level++) + line + '\n';
			
			continue;
		}
		
		// close tags
		let closeMatch = /<\s*\/\s*[\w\d]+>/.exec(line);
		if (closeMatch !== null && closeMatch[0] == line) {
			output += _strRepeat(tab, --level) + line + '\n';
		}
		
		// one-liners (items that do not affect level)
		else {
			output += _strRepeat(tab, level) + line + '\n';
		}
	}
	
	return output;
}