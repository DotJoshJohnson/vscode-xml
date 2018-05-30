import { Position } from "vscode";
import { DOMParser } from "xmldom";

import { XmlTraverser } from "../common";

export class XPathBuilder {

    private _xmlTraverser: XmlTraverser;

    constructor(private _xmlDocument: Document) {
        this._xmlTraverser = new XmlTraverser(this._xmlDocument);
    }

    build(position: Position): string {
        const selectedNode = this._xmlTraverser.getNodeAtPosition(position);

        return this._buildCore(selectedNode);
    }

    private _buildCore(selectedNode: Node): string {
        if (selectedNode === this._xmlDocument.documentElement) {
            return `/${selectedNode.nodeName}`;
        }

        if (!this._xmlTraverser.isElement(selectedNode)) {
            return `${this._buildCore((selectedNode as any).ownerElement)}/@${selectedNode.nodeName}`;
        }

        else if (this._xmlTraverser.hasSimilarSiblings(selectedNode)) {
            const siblings = this._xmlTraverser.getSiblings(selectedNode);
            const xPathIndex = (siblings.indexOf(selectedNode) + 1);

            return `${this._buildCore(selectedNode.parentNode)}/${selectedNode.nodeName}[${xPathIndex}]`;
        }

        else {
            return `${this._buildCore(selectedNode.parentNode)}/${selectedNode.nodeName}`;
        }
    }

}
