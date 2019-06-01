import { Position } from "vscode";
import { DOMParser } from "xmldom";

export class XmlTraverser {

    constructor(private _xmlDocument: Document) { }

    get xmlDocument(): Document {
        return this._xmlDocument;
    }

    set xmlDocument(value: Document) {
        this._xmlDocument = value;
    }

    getChildAttributeArray(node: Element): any[] {
        if (!node.attributes) {
            return [];
        }

        const array = new Array<any>();

        for (let i = 0; i < node.attributes.length; i++) {
            array.push(node.attributes[i]);
        }

        return array;
    }

    getChildElementArray(node: Node): any[] {
        if (!node.childNodes) {
            return [];
        }

        const array = new Array<any>();

        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];

            if (this.isElement(child)) {
                array.push(child);
            }
        }

        return array;
    }

    getElementAtPosition(position: Position): Element {
        const node = this.getNodeAtPosition(position);

        return this.getNearestElementAncestor(node);
    }

    getNearestElementAncestor(node: Node): Element {
        if (!this.isElement) {
            return this.getNearestElementAncestor(node.parentNode);
        }

        return <Element>node;
    }

    getNodeAtPosition(position: Position): Node {
        return this._getNodeAtPositionCore(position, this._xmlDocument.documentElement);
    }

    getSiblings(node: Node): Node[] {
        if (this.isElement(node)) {
            return this.getSiblingElements(node);
        }

        return this.getSiblingAttributes(node);
    }

    getSiblingAttributes(node: Node): Node[] {
        return this.getChildAttributeArray(<Element>node.parentNode);
    }

    getSiblingElements(node: Node): Node[] {
        return this.getChildElementArray(node.parentNode);
    }

    hasSimilarSiblings(node: Node): boolean {
        if (!node || !node.parentNode || !this.isElement(node)) {
            return false;
        }

        const siblings = this.getChildElementArray(<Element>node.parentNode);

        return (siblings.filter(x => x.tagName === (node as Element).tagName).length > 1);
    }

    isElement(node: Node): boolean {
        return (!!node && !!(node as Element).tagName);
    }

    private _getNodeAtPositionCore(position: Position, contextNode: Node): Node {
        if (!contextNode) {
            return undefined;
        }

        const lineNumber = (contextNode as any).lineNumber;
        const columnNumber = (contextNode as any).columnNumber;
        const columnRange = [columnNumber, (columnNumber + (this._getNodeWidthInCharacters(contextNode) - 1))];

        // for some reason, xmldom sets the column number for attributes to the "="
        if (!this.isElement(contextNode)) {
            columnRange[0] = (columnRange[0] - contextNode.nodeName.length);
        }

        if (this._checkRange(lineNumber, position, columnRange)) {
            return contextNode;
        }

        if (this.isElement(contextNode)) {
            // if the element contains text, check to see if the cursor is present in the text
            const textContent = (contextNode as Element).textContent;

            if (textContent) {
                columnRange[1] = (columnRange[1] + textContent.length);

                if (this._checkRange(lineNumber, position, columnRange)) {
                    return contextNode;
                }
            }

            const children = [...this.getChildAttributeArray(<Element>contextNode), ...this.getChildElementArray(contextNode)];
            let result: Node;

            for (let i = 0; i < children.length; i++) {
                const child = children[i];

                result = this._getNodeAtPositionCore(position, child);

                if (result) {
                    return result;
                }
            }
        }

        return undefined;
    }

    private _checkRange(lineNumber: number, position: Position, columnRange: number[]): boolean {
        return (lineNumber === (position.line + 1) && ((position.character + 1) >= columnRange[0] && (position.character + 1) < columnRange[1]));
    }

    private _getNodeWidthInCharacters(node: Node) {
        if (this.isElement(node)) {
            return (node.nodeName.length + 2);
        }

        else {
            return (node.nodeName.length + node.nodeValue.length + 3);
        }
    }
}
