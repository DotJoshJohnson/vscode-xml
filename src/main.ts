'use strict';

import { commands, ExtensionContext } from 'vscode';
import { formatXml } from './features/xmlFormatting';

export function activate(ctx: ExtensionContext) {
	// check for update
	//...
	
	// register pallete commands
	ctx.subscriptions.push(commands.registerTextEditorCommand('xmltools.formatXml', formatXml));
}