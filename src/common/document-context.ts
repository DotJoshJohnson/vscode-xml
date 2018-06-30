import { BehaviorSubject, Observable, merge } from "rxjs";
import { ExtensionContext, TextDocument, Uri, workspace } from "vscode";

export class DocumentContext {

    private static _contexts = new Array<DocumentContext>();

    private _data = new Map<string, any>();
    private _dataChangesSubject = new BehaviorSubject<DocumentContext>(this);
    private _documentChangesSubject = new BehaviorSubject<DocumentContext>(this);

    constructor(private _document: TextDocument) { }

    static allDocumentChanges(): Observable<DocumentContext> {
        return merge(...this._contexts.map(x => x.documentChanges));
    }

    get dataChanges(): Observable<DocumentContext> {
        return this._dataChangesSubject.asObservable();
    }

    get documentChanges(): Observable<any> {
        return this._documentChangesSubject.asObservable();
    }

    get document(): TextDocument {
        return this._document;
    }

    static configure(context: ExtensionContext): void {
        context.subscriptions.push(
            workspace.onDidChangeTextDocument(e => {
                const uri = e.document.uri;
                let docContext = this.get(uri);

                if (!docContext) {
                    docContext = new DocumentContext(e.document);
                }

                else {
                    docContext._document = e.document;
                }

                docContext._documentChangesSubject.next(docContext);
            }),

            workspace.onDidCloseTextDocument(e => {
                const docContext = this.get(e.uri);

                if (docContext) {
                    this._contexts.splice(this._contexts.indexOf(docContext), 1);
                }
            })
        );
    }

    static get(uri: Uri): DocumentContext | undefined {
        return this._contexts.find(x => x.document.uri.toString() === uri.toString());
    }

    getContextData<T>(key: string): T {
        return this._data.get(key);
    }

    setContextData(key: string, value: any, suppressChangeEvent?: boolean): void {
        this._data.set(key, value);

        if (!suppressChangeEvent) {
            this._dataChangesSubject.next(this);
        }
    }

}
