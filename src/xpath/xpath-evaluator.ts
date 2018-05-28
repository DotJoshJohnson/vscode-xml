import * as xpath from "xpath";
import { SelectedValue, XPathSelect } from "xpath";
import { DOMParser } from "xmldom";

export class EvaluatorResult {
    type: EvaluatorResultType;
    result: Node[] | number | string | boolean;
}

export class EvaluatorResultType {
    static SCALAR_TYPE = 0;
    static NODE_COLLECTION = 1;
}

export class XPathResultTypes {
    static ANY_TYPE = 0;
    static NUMBER_TYPE = 1;
    static STRING_TYPE = 2;
    static BOOLEAN_TYPE = 3;
    static UNORDERED_NODE_ITERATOR_TYPE = 4;
    static ORDERED_NODE_ITERATOR_TYPE = 5;
    static UNORDERED_NODE_SNAPSHOT_TYPE = 6;
    static ORDERED_NODE_SNAPSHOT_TYPE = 7;
    static ANY_UNORDERED_NODE_TYPE = 8;
    static FIRST_ORDERED_NODE_TYPE = 9;
}

export class XPathEvaluator {
    static evaluate(query: string, xml: string, ignoreDefaultNamespace: boolean): EvaluatorResult {
        if (ignoreDefaultNamespace) {
            xml = xml.replace(/xmlns=".+"/g, (match: string) => {
                return match.replace(/xmlns/g, "xmlns:default");
            });
        }

        const nodes = new Array<Node>();
        const xdoc: Document = new DOMParser().parseFromString(xml, "text/xml");
        const resolver = (xpath as any).createNSResolver(xdoc);
        const xPathResult = xpath.evaluate(query, xdoc, resolver, 0, null);

        const evaluatorResult = new EvaluatorResult();
        evaluatorResult.type = EvaluatorResultType.SCALAR_TYPE;

        switch (xPathResult.resultType) {
            case XPathResultTypes.NUMBER_TYPE:
                evaluatorResult.result = xPathResult.numberValue;
                break;
            case XPathResultTypes.STRING_TYPE:
                evaluatorResult.result = xPathResult.stringValue;
                break;
            case XPathResultTypes.BOOLEAN_TYPE:
                evaluatorResult.result = xPathResult.booleanValue;
                break;
            case XPathResultTypes.UNORDERED_NODE_ITERATOR_TYPE:
            case XPathResultTypes.ORDERED_NODE_ITERATOR_TYPE:
                evaluatorResult.result = xPathResult.booleanValue;

                let node: Node;

                while (node = xPathResult.iterateNext()) {
                    nodes.push(node);
                }

                evaluatorResult.result = nodes;
                evaluatorResult.type = EvaluatorResultType.NODE_COLLECTION;
                break;
        }


        return evaluatorResult;
    }
}
