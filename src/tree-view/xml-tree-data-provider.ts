import { commands, window, workspace } from "vscode";
import {
    Event, EventEmitter, ExtensionContext, TextEditor, TreeDataProvider,
    TreeItem, TreeItemCollapsibleState
} from "vscode";

import * as path from "path";
import { DOMParser } from "xmldom";

import * as constants from "../constants";

export class XmlTreeDataProvider implements TreeDataProvider<any> {
    private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
    private _xmlDocument: any;

    constructor(private _context: ExtensionContext) {
        window.onDidChangeActiveTextEditor(() => {
            this._refreshTree();
        });

        workspace.onDidChangeTextDocument(() => {
            this._refreshTree();
        });
    }

    onDidChangeTreeData = this._onDidChangeTreeData.event;

    get activeEditor(): TextEditor {
        return window.activeTextEditor || null;
    }

    getTreeItem(element: any): TreeItem | Thenable<TreeItem> {
        const treeItem = new TreeItem(element.localName);

        if (this._getChildAttributeArray(element).length > 0) {
            treeItem.collapsibleState = TreeItemCollapsibleState.Collapsed;
        }

        if (this._getChildElementArray(element).length > 0) {
            treeItem.collapsibleState = TreeItemCollapsibleState.Collapsed;
        }

        treeItem.command = {
            command: constants.nativeCommands.revealLine,
            title: "",
            arguments: [{
                lineNumber: element.lineNumber - 1,
                at: "top"
            }]
        };

        treeItem.iconPath = this._getIcon(element);

        return treeItem;
    }

    getChildren(element?: any): any[] | Thenable<any[]> {
        if (!this._xmlDocument) {
            this._refreshTree();
        }

        if (element) {
            return [].concat(this._getChildAttributeArray(element), this._getChildElementArray(element));
        }

        else if (this._xmlDocument) {
            return [this._xmlDocument.lastChild];
        }

        else {
            return [];
        }
    }

    private _getChildAttributeArray(node: any): any[] {
        if (!node.attributes) {
            return [];
        }

        const array = new Array<any>();

        for (let i = 0; i < node.attributes.length; i++) {
            array.push(node.attributes[i]);
        }

        return array;
    }

    private _getChildElementArray(node: any): any[] {
        if (!node.childNodes) {
            return [];
        }

        const array = new Array<any>();

        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];

            if (child.tagName) {
                array.push(child);
            }
        }

        return array;
    }

    private _getIcon(element: any): any {
        let type = "element";

        if (!element.tagName) {
            type = "attribute";
        }

        const icon = {
            dark: this._context.asAbsolutePath(path.join("resources", "icons", `${type}.dark.svg`)),
            light: this._context.asAbsolutePath(path.join("resources", "icons", `${type}.light.svg`))
        };

        return icon;
    }

    private _refreshTree(): void {
        if (!this.activeEditor || this.activeEditor.document.languageId !== constants.languageIds.xml) {
            commands.executeCommand(constants.nativeCommands.setContext, constants.contextKeys.xmlTreeViewEnabled, false);

            this._xmlDocument = null;
            this._onDidChangeTreeData.fire();
            return;
        }

        const config = workspace.getConfiguration(constants.extensionPrefix);
        const enableTreeView = config.get<boolean>(constants.configKeys.enableXmlTreeView, true);

        commands.executeCommand(constants.nativeCommands.setContext, constants.contextKeys.xmlTreeViewEnabled, enableTreeView);

        const xml = this.activeEditor.document.getText();
        this._xmlDocument = new DOMParser().parseFromString(xml, "text/xml");

        this._onDidChangeTreeData.fire();
    }

}
