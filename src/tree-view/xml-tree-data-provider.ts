import { commands, window, workspace } from "vscode";
import {
    Event, EventEmitter, ExtensionContext, Position, TextEditor, TreeDataProvider,
    TreeItem, TreeItemCollapsibleState
} from "vscode";

import * as path from "path";
import { DOMParser } from "xmldom";

import { Configuration } from "../common";
import * as constants from "../constants";

export class XmlTreeDataProvider implements TreeDataProvider<any> {
    private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
    private _xmlDocument: Document;

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
        const enableMetadata = Configuration.enableXmlTreeViewMetadata;
        const enableSync = Configuration.enableXmlTreeViewCursorSync;

        const treeItem = new TreeItem(element.localName);

        if (!this._isElement(element)) {
            treeItem.label = `${element.localName} = "${element.nodeValue}"`;
        }

        else if (enableMetadata) {
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

            if (this._hasSimilarSiblings(<Element>element) && enableSync) {
                treeItem.label += ` [line ${(element as any).lineNumber}]`;
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

    getChildren(element?: Node): Node[] | Thenable<Node[]> {
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

    getParent(element: Node): Node {
        if (!element || !element.parentNode || !element.parentNode.parentNode) {
            return undefined;
        }

        return element.parentNode;
    }

    getNodeAtPosition(position: Position): Node {
        return this._getNodeAtPositionCore(position, this._xmlDocument.documentElement);
    }

    private _getNodeAtPositionCore(position: Position, contextElement: Element): Node {
        if (!contextElement) {
            return undefined;
        }

        if (((contextElement as any).lineNumber - 1) === position.line) {
            return contextElement;
        }

        const children = this._getChildElementArray(<Element>contextElement);
        let result: Node;

        for (let i = 0; i < children.length; i++) {
            const child = children[i];

            result = this._getNodeAtPositionCore(position, child);

            if (result) {
                return result;
            }
        }

        return undefined;
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

    private _hasSimilarSiblings(element: Element): boolean {
        if (!element || !element.parentNode) {
            return false;
        }

        const siblings = this._getChildElementArray(<Element>element.parentNode);

        return (siblings.filter(x => x.tagName === element.tagName).length > 1);
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

        const enableTreeView = Configuration.enableXmlTreeView;

        commands.executeCommand(constants.nativeCommands.setContext, constants.contextKeys.xmlTreeViewEnabled, enableTreeView);

        const xml = this.activeEditor.document.getText();

        try {
            this._xmlDocument = new DOMParser({
                errorHandler: () => {
                    throw new Error("Invalid Document");
                }
            }).parseFromString(xml, "text/xml");
        }

        catch {
            this._xmlDocument = new DOMParser().parseFromString("<InvalidDocument />", "text/xml");
        }

        this._onDidChangeTreeData.fire();
    }

}
