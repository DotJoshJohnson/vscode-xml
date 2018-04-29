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

    getTreeItem(element: Node): TreeItem | Thenable<TreeItem> {
        const treeItem = new TreeItem(element.localName);

        if (!this._isElement(element)) {
            treeItem.label = `${element.localName} = "${element.nodeValue}"`;
        }

        else {
            const childAttributes = this._getChildAttributeArray(<Element>element);
            const childElements = this._getChildElementArray(<Element>element);
            const totalChildren = (childAttributes.length + childElements.length);

            if (totalChildren > 0) {
                treeItem.label += "  (";

                if (childAttributes.length > 0) {
                    treeItem.label += `attributes: ${childAttributes.length}, `;
                    treeItem.collapsibleState = TreeItemCollapsibleState.Collapsed;
                }

                if (childElements.length > 0) {
                    treeItem.label += `children: ${childElements.length}, `;
                    treeItem.collapsibleState = TreeItemCollapsibleState.Collapsed;
                }

                treeItem.label = treeItem.label.substr(0, treeItem.label.length - 2);
                treeItem.label += ")";
            }
        }

        treeItem.command = {
            command: constants.nativeCommands.revealLine,
            title: "",
            arguments: [{
                lineNumber: (element as any).lineNumber - 1,
                at: "top"
            }]
        };

        treeItem.iconPath = this._getIcon(element);

        return treeItem;
    }

    getChildren(element?: Node): any[] | Thenable<any[]> {
        if (!this._xmlDocument) {
            this._refreshTree();
        }

        if (this._isElement(element)) {
            return [].concat(this._getChildAttributeArray(<Element>element), this._getChildElementArray(<Element>element));
        }

        else if (this._xmlDocument) {
            return [this._xmlDocument.lastChild];
        }

        else {
            return [];
        }
    }

    private _getChildAttributeArray(node: Element): any[] {
        if (!node.attributes) {
            return [];
        }

        const array = new Array<any>();

        for (let i = 0; i < node.attributes.length; i++) {
            array.push(node.attributes[i]);
        }

        return array;
    }

    private _getChildElementArray(node: Element): any[] {
        if (!node.childNodes) {
            return [];
        }

        const array = new Array<any>();

        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];

            if (this._isElement(child)) {
                array.push(child);
            }
        }

        return array;
    }

    private _getIcon(element: Node): any {
        let type = "element";

        if (!this._isElement(element)) {
            type = "attribute";
        }

        const icon = {
            dark: this._context.asAbsolutePath(path.join("resources", "icons", `${type}.dark.svg`)),
            light: this._context.asAbsolutePath(path.join("resources", "icons", `${type}.light.svg`))
        };

        return icon;
    }

    private _isElement(node: Node): boolean {
        return (!!node && !!(node as Element).tagName);
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

        try {
            this._xmlDocument = new DOMParser().parseFromString(xml, "text/xml");
            this._onDidChangeTreeData.fire();
        }

        catch {
            this._xmlDocument = new DOMParser().parseFromString("<InvalidDocument />", "text/xml");
        }
    }

}
