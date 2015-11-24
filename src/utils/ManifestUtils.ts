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
	
	refresh(): void {
		let manifest = this._extension.packageJSON;
		
		this.name = manifest.name;
		this.version = manifest.version;
		this.publisher = manifest.publisher;
		this.displayName = manifest.displayName;
		this.description = manifest.description;
		this.categories = manifest.categories;
		this.keywords = manifest.keywords;
		this.icon = manifest.icon;
	}
}