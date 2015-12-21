'use strict';

import { window, TextEditor, TextEditorEdit, OutputChannel, ViewColumn, workspace } from 'vscode';

let xpath = require('xpath');
let dom = require('xmldom').DOMParser;
let resultChannel: OutputChannel = null;

export function evaluateXPath(editor: TextEditor, edit: TextEditorEdit): void {
    let isPersistant = workspace.getConfiguration().has('xmlTools.PersistXPathQuery') && workspace.getConfiguration('xmlTools').get<boolean>('PersistXPathQuery') === true	    
    
    window.showInputBox({
		placeHolder: 'XPath Query',
		prompt: 'Please enter an XPath query to evaluate.',
		value: isPersistant ? Singleton.getXPathValue() : ''
		
	}).then((query) => {
		if (query === undefined) return;
		
		let xml = editor.document.getText();
		let doc = new dom().parseFromString(xml);
		
		Singleton.setXPathValue(query);
		
		try {
			var nodes = xpath.select(query, doc);
		}
		
		catch (ex) {
			window.showErrorMessage(ex);
			return;
		}
		
		if (nodes === null || nodes === undefined || nodes.length == 0) {
			window.showInformationMessage('Your XPath query returned no results.');
			return;
		}

		if (resultChannel === null) resultChannel = window.createOutputChannel('XPath Evaluation Results');
		resultChannel.clear();
				
		nodes.forEach((node) => {
			resultChannel.appendLine(`${node.localName}: ${node.firstChild.data}`);
		});
		
		resultChannel.show(ViewColumn.Three);
	});
}

namespace Singleton {
	
	class XPathContext 
	{
		static _lastXPathValue:string = '';
	}
		
    export function getXPathValue():string
	{ 
		 return XPathContext._lastXPathValue;
	}
	
	export function setXPathValue(val:string):void 
	{ 
		 XPathContext._lastXPathValue = val;
	}
}