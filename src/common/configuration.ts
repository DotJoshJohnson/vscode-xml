import { workspace, Uri } from "vscode";

const ExtensionTopLevelSection = "xmlTools";

export class Configuration {
    static get enableXmlTreeView(): boolean {
        return this._getForWindow<boolean>("enableXmlTreeView");
    }

    static get enableXmlTreeViewMetadata(): boolean {
        return this._getForWindow<boolean>("enableXmlTreeViewMetadata");
    }

    static get enableXmlTreeViewCursorSync(): boolean {
        return this._getForWindow<boolean>("enableXmlTreeViewCursorSync");
    }

    static get ignoreDefaultNamespace(): boolean {
        return this._getForWindow<boolean>("ignoreDefaultNamespace");
    }

    static get persistXPathQuery(): boolean {
        return this._getForWindow<boolean>("persistXPathQuery");
    }

    static get xmlFormatterImplementation(): string {
        return this._getForWindow<string>("xmlFormatterImplementation");
    }

    static get xqueryExecutionArguments(): string[] {
        return this._getForWindow<string[]>("xqueryExecutionArguments");
    }

    static get xqueryExecutionEngine(): string {
        return this._getForWindow<string>("xqueryExecutionEngine");
    }

    static get xqueryExecutionInputLimit(): number {
        return this._getForWindow<number>("xqueryExecutionInputLimit");
    }

    static get xqueryExecutionInputSearchPattern(): string {
        return this._getForWindow<string>("xqueryExecutionInputSearchPattern");
    }

    static enforcePrettySelfClosingTagOnFormat(resource: Uri): boolean {
        return this._getForResource<boolean>("enforcePrettySelfClosingTagOnFormat", resource);
    }

    static removeCommentsOnMinify(resource: Uri): boolean {
        return this._getForResource<boolean>("removeCommentsOnMinify", resource);
    }

    static splitAttributesOnFormat(resource: Uri): boolean {
        return this._getForResource<boolean>("splitAttributesOnFormat", resource);
    }

    static splitXmlnsOnFormat(resource: Uri): boolean {
        return this._getForResource<boolean>("splitXmlnsOnFormat", resource);
    }

    private static _getForResource<T>(section: string, resource: Uri): T {
        return workspace.getConfiguration(ExtensionTopLevelSection, resource).get<T>(section);
    }

    private static _getForWindow<T>(section: string): T  {
        return workspace.getConfiguration(ExtensionTopLevelSection).get<T>(section);
    }
}
