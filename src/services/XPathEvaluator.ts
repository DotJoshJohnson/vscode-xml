'use strict';

import * as xpath from 'xpath';

let DOMParser = require('xmldom').DOMParser;

export class XPathEvaluator {
    static evaluate(query: string, xml: string, ignoreDefaultNamespace: boolean): Node[] {
        if (ignoreDefaultNamespace) {
            xml = xml.replace(/xmlns=".+"/g, (match: string) => {
                return match.replace(/xmlns/g, 'xmlns:default');
            });
        }
        
        let nodes: Node[] = new Array<Node>();
        
        let xdoc: Document = new DOMParser().parseFromString(xml, 'text/xml');
        
        let resolver: xpath.XPathNSResolver = xpath.createNSResolver(xdoc);
        let expression: xpath.XPathExpression = xpath.createExpression(query, resolver);
        let result: xpath.XPathResult = expression.evaluate(xdoc, xpath.XPathResult.ORDERED_NODE_ITERATOR_TYPE);
        
        let node: Node;
        while (node = result.iterateNext()) {
            nodes.push(node);
        }
        
        return nodes;
    }
}