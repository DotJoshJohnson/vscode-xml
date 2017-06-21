let XQLint = require('xqlint').XQLint;

export class XQueryCompleter {
    constructor(script: string) {
        this.script = script;
    }
    
    private _script: string;
    private _linter: any;
    
    get script(): string {
        return this._script;
    }
    
    set script(value: string) {
        this._script = value;
        this._linter = new XQLint(this._script);
    }
    
    getCompletions(line: number, column: number): XQueryCompletionItem[] {
        let items: XQueryCompletionItem[] = new Array<XQueryCompletionItem>();
        
        this._linter.getCompletions({line: line, col: column}).forEach((completion: any) => {
            items.push(new XQueryCompletionItem(completion.name, completion.value, completion.meta));
        });
        
        return items;
    }
}

export class XQueryCompletionItem {
    constructor(name: string, value: string, meta: string) {
        this.name = name;
        this.value = value;
        this.meta = meta;
    }
    
    name: string;
    value: string;
    meta: string;
}