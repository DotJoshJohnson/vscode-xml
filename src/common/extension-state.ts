import { ExtensionContext, Memento } from "vscode";

export class ExtensionState {
    private static _context: ExtensionContext;

    static get global(): Memento {
        return this._context.globalState;
    }

    static get workspace(): Memento {
        return this._context.workspaceState;
    }

    static configure(context: ExtensionContext): void {
        this._context = context;
    }
}
