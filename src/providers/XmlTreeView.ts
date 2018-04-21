import * as vsc from "vscode";
import * as path from "path";

let DOMParser = require("xmldom").DOMParser;

export class XmlTreeViewDataProvider implements vsc.TreeDataProvider<Node> {
    private _onDidChangeTreeData: vsc.EventEmitter<Node | null> = new vsc.EventEmitter<Node | null>();
    private _xmlDocument: Document;

    constructor(private _context: vsc.ExtensionContext) {
        vsc.window.onDidChangeActiveTextEditor((editor) => {
            this._refreshTree();
        });

        vsc.workspace.onDidChangeTextDocument((e) => {
            this._refreshTree();
        });
    }

    readonly onDidChangeTreeData: vsc.Event<Node | null> = this._onDidChangeTreeData.event;

    get activeEditor(): vsc.TextEditor | null {
        return vsc.window.activeTextEditor || null;
    }

    getChildren(element?: Element): Node[] {
        if (!this._xmlDocument) {
            this._refreshTree();
        }

        if (element) {
            return [].concat(this._getChildAttributeArray(element), this._getChildElementArray(element));
        }

        else if (this._xmlDocument) {
            return [ this._xmlDocument.lastChild ];
        }

        else {
            return [];
        }
    }

    getTreeItem(element: Element): vsc.TreeItem {
        let treeItem = new vsc.TreeItem(element.localName);

        if (this._getChildAttributeArray(element).length > 0) {
            treeItem.collapsibleState = vsc.TreeItemCollapsibleState.Collapsed;
        }

        if (this._getChildElementArray(element).length > 0) {
            treeItem.collapsibleState = vsc.TreeItemCollapsibleState.Collapsed;
        }

        treeItem.command = {
            command: "revealLine",
            title: "",
            arguments: [{
                lineNumber: (element as any).lineNumber - 1,
                at: "top"
            }]
        };

        treeItem.iconPath = this._getIcon(element);

        return treeItem;
    }

    private _getChildAttributeArray(node: Element): Node[] {
        if (!node.attributes) {
            return [];
        }

        let array = new Array<Node>();

        for (let i = 0; i < node.attributes.length; i++) {
            array.push(node.attributes[i]);
        }

        return array;
    }

    private _getChildElementArray(node: Node): Node[] {
        if (!node.childNodes) {
            return [];
        }

        let array = new Array<Node>();

        for (let i = 0; i < node.childNodes.length; i++) {
            let child = node.childNodes[i];

            if ((child as any).tagName) {
                array.push(child);
            }
        }

        return array;
    }

    private _getIcon(element: Node): any {
        let type = "element";
        
        if (!(element as any).tagName) {
            type = "attribute";
        }

        let icon = {
            dark: this._context.asAbsolutePath(path.join("resources", "icons", `${type}.dark.svg`)),
            light: this._context.asAbsolutePath(path.join("resources", "icons", `${type}.light.svg`))
        };

        return icon;
    }

    private _refreshTree(): void {
        if (!this.activeEditor || this.activeEditor.document.languageId !== "xml") {
            this._xmlDocument = null;
            this._onDidChangeTreeData.fire();
            return;
        }

        let xml = this.activeEditor.document.getText();
        this._xmlDocument = new DOMParser().parseFromString(xml, "text/xml");

        this._onDidChangeTreeData.fire();
    }
}