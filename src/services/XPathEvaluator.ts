'use strict';

import * as xpath from 'xpath';

let DOMParser = require('xmldom').DOMParser;

export class EvaluatorResult {
    type: EvaluatorResultType;
    result: Node[]|number|string|boolean;
}

export class EvaluatorResultType {
    static SCALAR_TYPE: number = 0;
    static NODE_COLLECTION: number = 1;
}

export class XPathEvaluator {
    static evaluate(query: string, xml: string, ignoreDefaultNamespace: boolean): EvaluatorResult {
        if (ignoreDefaultNamespace) {
            xml = xml.replace(/xmlns=".+"/g, (match: string) => {
                return match.replace(/xmlns/g, 'xmlns:default');
            });
        }
        
        let nodes: Node[] = new Array<Node>();
        
        let xdoc: Document = new DOMParser().parseFromString(xml, 'text/xml');
        
        let resolver: xpath.XPathNSResolver = xpath.createNSResolver(xdoc);
        let result: xpath.XPathResult = xpath.evaluate(
            query,            // xpathExpression
            xdoc,                        // contextNode
            resolver,                       // namespaceResolver
            xpath.XPathResult.ANY_TYPE, // resultType
            null                        // result
        )

        let evalResult = new EvaluatorResult();
        evalResult.type = EvaluatorResultType.SCALAR_TYPE;
        
        switch(result.resultType) {
            case xpath.XPathResult.NUMBER_TYPE:
                evalResult.result = result.numberValue;
                break; 
            case xpath.XPathResult.STRING_TYPE:
                evalResult.result = result.stringValue;
                break; 
            case xpath.XPathResult.BOOLEAN_TYPE:
                evalResult.result = result.booleanValue;
                break; 
            case xpath.XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
            case xpath.XPathResult.ORDERED_NODE_ITERATOR_TYPE:
                evalResult.result = result.booleanValue;
                let node: Node;
                while (node = result.iterateNext()) {
                    nodes.push(node);
                }
                evalResult.result = nodes;
                evalResult.type = EvaluatorResultType.NODE_COLLECTION;
                break; 
        }

        return evalResult;
    }
}