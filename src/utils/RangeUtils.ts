'use strict';

import { TextDocument, Range, Position } from 'vscode';

export function getRangeForDocument(document: TextDocument): Range {
	let lastLineIndex = (document.lineCount - 1);
	let range = new Range(new Position(0, 0), new Position(lastLineIndex, Number.MAX_VALUE));

	range = document.validateRange(range);
	
	return range;
}