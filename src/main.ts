'use strict';

import { commands, languages, ExtensionContext } from 'vscode';
import { linearizeXml, XmlDocumentFormattingProvider, XmlRangeFormattingProvider } from './features/xmlFormatting';
import { evaluateXPath } from './features/xmlXPathEngine';
import { checkForUpdates } from './utils/UpdateNotifier';

export function activate(ctx: ExtensionContext) {
	// check for update
	checkForUpdates();
	
	// register palette commands
	ctx.subscriptions.push(commands.registerTextEditorCommand('xmltools.linearizeXml', linearizeXml));
	ctx.subscriptions.push(commands.registerTextEditorCommand('xmltools.evaluateXPath', evaluateXPath));
	
	// alias for editor.action.format
	ctx.subscriptions.push(commands.registerTextEditorCommand('xmlTools.formatXml', () => {
		commands.executeCommand('editor.action.format');
	}));
	
	// register formatting providers
	ctx.subscriptions.push(languages.registerDocumentFormattingEditProvider('xml', new XmlDocumentFormattingProvider()));
	ctx.subscriptions.push(languages.registerDocumentRangeFormattingEditProvider('xml', new XmlRangeFormattingProvider()));
}