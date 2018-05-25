import { commands } from "vscode";

export class NativeCommands {
    static async cursorMove(to: string, by: string): Promise<void> {
        await commands.executeCommand("cursorMove", {
            to: to,
            by: by
        });
    }

    static openGlobalSettings(): void {
        commands.executeCommand("workbench.action.openGlobalSettings");
    }

    static setContext(key: string, value: any): void {
        commands.executeCommand("setContext", key, value);
    }
}
