import { xmlParse, xsltProcess } from "xslt-processor";

export class XSLTTransform {
    private _xml: string;
    private _xslt: string;
    constructor(xml: string, xslt: string) {
        this._xml = xml;
        this._xslt = xslt;
    }
    public apply(): string {
        try {
            return xsltProcess(xmlParse(this._xml), xmlParse(this._xslt));
        }
        catch (e) {
            throw new Error(e);
        }
    }
}
