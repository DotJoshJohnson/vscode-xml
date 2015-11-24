'use strict';

import { window } from 'vscode';
import { ExtensionManifestReader } from './ManifestUtils';

let req = require('request');
let semver = require('semver');

export function checkForUpdates() {
	let manifestReader: ExtensionManifestReader = new ExtensionManifestReader('DotJoshJohnson.xml');
	let currentVersion = manifestReader.version;
	
	// use the GitHub api to determine the latest released version
	let url = 'https://api.github.com/repos/DotJoshJohnson/vscode-xml/releases/latest';
	let options = {
		url: url,
		headers: {
			// the GitHub API requires a user agent header
			// we are spoofing a Chrome user agent string here
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36'
		}
	}
	
	req(options, (error, response, body) => {
		if (!error && response.statusCode == 200) {
			let release = JSON.parse(body);
			let latestVersion = release.name.substring(1); // the telease/tag is prefixed with a "v"
			
			if (!release.draft && semver.gt(latestVersion, currentVersion)) {
				window.showInformationMessage(`Version ${latestVersion} of the ${manifestReader.displayName} extension is available.`);
			}
		}
	});
}