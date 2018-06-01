import { workspace, Uri } from "vscode";

const ExtensionTopLevelSection = "xmlTools";
const UseNewSettingsSection = "core.useNewSettings";

export class Configuration {
    static get treeViewEnabled(): boolean {
        return this._getForWindow<boolean>("treeView.enabled", "enableXmlTreeView");
    }

    static get treeViewShowMetadata(): boolean {
        return this._getForWindow<boolean>("treeView.showMetadata", "enableXmlTreeViewMetadata");
    }

    static get treeViewSyncCursor(): boolean {
        return this._getForWindow<boolean>("treeView.syncCursor", "enableXmlTreeViewCursorSync");
    }

    static get xpathIgnoreDefaultNamespace(): boolean {
        return this._getForWindow<boolean>("xpath.ignoreDefaultNamespace", "ignoreDefaultNamespace");
    }

    static get xpathRememberLastQuery(): boolean {
        return this._getForWindow<boolean>("xpath.rememberLastQuery", "persistXPathQuery");
    }

    static get formatterImplementation(): string {
        return this._getForWindow<string>("formatter.implementation", "xmlFormatterImplementation");
    }

    static get xqueryExecutableArgs(): string[] {
        return this._getForWindow<string[]>("xquery.executableArgs", "xqueryExecutionArguments");
    }

    static get xqueryExecutable(): string {
        return this._getForWindow<string>("xquery.executable", "xqueryExecutionEngine");
    }

    static get xqueryInputFilesLimit(): number {
        return this._getForWindow<number>("xquery.inputFilesLimit", "xqueryExecutionInputLimit");
    }

    static get xqueryInputFilesSearchPattern(): string {
        return this._getForWindow<string>("xquery.inputFilesSearchPattern", "xqueryExecutionInputSearchPattern");
    }

    static formatterAddSpaceBeforeSelfClose(resource: Uri): boolean {
        return this._getForResource<boolean>("formatter.addSpaceBeforeSelfClose", resource, "enforcePrettySelfClosingTagOnFormat");
    }

    static formatterRemoveCommentsOnMinify(resource: Uri): boolean {
        return this._getForResource<boolean>("formatter.removeCommentsOnMinify", resource, "removeCommentsOnMinify");
    }

    static formatterSplitAttributes(resource: Uri): boolean {
        return this._getForResource<boolean>("formatter.splitAttributes", resource, "splitAttributesOnFormat");
    }

    static formatterSplitXmlnsAttributes(resource: Uri): boolean {
        return this._getForResource<boolean>("formatter.splitXmlnsAttributes", resource, "splitXmlnsOnFormat");
    }

    private static _getForResource<T>(section: string, resource: Uri, oldSection?: string): T {
        if (oldSection && !workspace.getConfiguration(ExtensionTopLevelSection).get<boolean>(UseNewSettingsSection)) {
            section = oldSection;
        }

        return workspace.getConfiguration(ExtensionTopLevelSection, resource).get<T>(section);
    }

    private static _getForWindow<T>(section: string, oldSection?: string): T  {
        if (oldSection && !workspace.getConfiguration(ExtensionTopLevelSection).get<boolean>(UseNewSettingsSection)) {
            section = oldSection;
        }

        return workspace.getConfiguration(ExtensionTopLevelSection).get<T>(section);
    }
}
