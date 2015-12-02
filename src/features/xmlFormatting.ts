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
	/* This code was taken from https://github.com/vkiryukhin/pretty-data/blob/master/pretty-data.js
	 * and refactored to fit our needs for this extension. pretty-data is dual-licensed (MIT/GPL).
	 */
	
	let parts = _linearizeXml(xml)
		.replace(/</g,"~::~<")
		.replace(/xmlns\:/g,"~::~xmlns:")
		.replace(/xmlns\=/g,"~::~xmlns=")
		.split('~::~');
	
	let tab = _strRepeat(' ', options.tabSize);
	let deep = 0;
	let output = '';
	let formatted = false;
	
	for (let i = 0; i < parts.length; i++) {
		
		// start comment, CDATA, or DOCTYPE
		if (parts[i].search(/<!/) > -1) {
			output += _strRepeat(tab, deep) + parts[i];
			formatted = true;
			
			// end comment, CDATA, or DOCTYPE
			if (parts[i].search(/-->/) > -1 || parts[i].search(/\]>/) > -1 || parts[i].search(/!DOCTYPE/) > -1) {
				formatted = false;
			}
		}
		
		// end comment or CDATA
		else if (parts[i].search(/-->/) > -1 || parts[i].search(/\]>/) > -1) {
			output += parts[i];
			formatted = false;
		}
		
		// <elm></elm>
		else if (/^<\w/.exec(parts[i - 1]) && /^<\/\w/.exec(parts[i]) && (/^<[\w:\-\.\,]+/.exec(parts[i - 1])[0] == /^<\/[\w:\-\.\,]+/.exec(parts[i])[0].replace('/','')) {
			output += parts[i];
			if (!formatted) deep--;
		}
		
		// <elm>
		else if (parts[i].search(/<\w/) > -1 && parts[i].search(/<\//) == -1 && parts[i].search(/\/>/) == -1 ) {
			output = !formatted ? output += _strRepeat(tab, deep++) + parts[i] : output += parts[i];
		}
		
		// <elm>...</elm>
		else if (parts[i].search(/<\w/) > -1 && parts[i].search(/<\//) > -1) {
			output = !formatted ? output += _strRepeat(tab, deep) + parts[i] : output += parts[i];
		}
		
		// </elm>
		else if (parts[i].search(/<\//) > -1) {
			output = !formatted ? output += _strRepeat(tab, --deep) + parts[i] : output += parts[i];
		}
		
		// <elm/>
		else if (parts[i].search(/\/>/) > -1) {
			output = !formatted ? output += _strRepeat(tab, deep) + parts[i] : output += parts[i];
		}
		
		// <?xml ... ?>
		else if (parts[i].search(/<\?/) > -1) {
			output += _strRepeat(tab, deep) + parts[i];
		}
		
		// xmlns
		else if (parts[i].search(/xmlns\:/) > -1  || parts[i].search(/xmlns\=/) > -1) {
			output += _strRepeat(tab, deep) + parts[i];
		}
		
		else {
			output += parts[i];
		}
	}
	
	return output;
}