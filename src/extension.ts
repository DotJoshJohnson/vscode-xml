import { workspace } from "vscode";
import { ExtensionContext, WorkspaceConfiguration } from "vscode";

const onActivateHandlers: OnActivateHandler[] = [];
const onDeactivateHandlers: OnDeactivateHandler[] = [];

export function activate(context: ExtensionContext) {
    const workspaceConfiguration = workspace.getConfiguration("xmlTools");

    onActivateHandlers.forEach(x => x(context, workspaceConfiguration));
}

export function deactivate() {
    onDeactivateHandlers.forEach(x => x());
}

export function onActivate(handler: OnActivateHandler): void {
    onActivateHandlers.push(handler);
}

export function onDeactivate(handler: OnDeactivateHandler): void {
    onDeactivateHandlers.push(handler);
}

export type OnActivateHandler = (context: ExtensionContext, config: WorkspaceConfiguration) => void;

export type OnDeactivateHandler = () => void;
