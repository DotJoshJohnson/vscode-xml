'use strict';

import { extensions, Extension } from 'vscode';

export class ExtensionManifestReader {
	constructor(extensionId: string) {
		this._extension = extensions.getExtension(extensionId);
		this.refresh();
	}
	
	private _extension: Extension<any>
	
	name: string;
	version: string;
	publisher: string;
	displayName: string;
	description: string;
	categories: string[];
	keywords: string[];
	icon: string;
	
	private _checkPropertyExists(propertyName: string) {
		for (let property in this) {
			if (property === propertyName) return true;
		}
		
		return false;
	}
	
	refresh(): void {
		let manifest = this._extension.packageJSON;
		
		for (let property in manifest)
		{
			if (this._checkPropertyExists(property)) {
				this[property] = manifest[property];
			}
		}
		
		this.displayName = manifest.displayName;
	}
}