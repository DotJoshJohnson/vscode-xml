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
            case xPathResult.NUMBER_TYPE:
                evaluatorResult.result = xPathResult.numberValue;
                break;
            case xPathResult.STRING_TYPE:
                evaluatorResult.result = xPathResult.stringValue;
                break;
            case xPathResult.BOOLEAN_TYPE:
                evaluatorResult.result = xPathResult.booleanValue;
                break;
            case xPathResult.UNORDERED_NODE_ITERATOR_TYPE:
            case xPathResult.ORDERED_NODE_ITERATOR_TYPE:
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
