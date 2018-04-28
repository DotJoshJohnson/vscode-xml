export const extensionPrefix = "xmlTools";

export namespace commands {
    export const evaluateXPath = "xmlTools.evaluateXPath";
    export const setContext = "setContext";
}

export namespace contextKeys {
    export const xmlTreeViewEnabled = "xmlTreeViewEnabled";
}

export namespace configKeys {
    export const enableXmlTreeView = "enableXmlTreeView";
    export const ignoreDefaultNamespace = "ignoreDefaultNamespace";
    export const persistXPathQuery = "persistXPathQuery";
}

export namespace stateKeys {
    export const xpathQueryHistory = "xpathQueryHistory";
    export const xPathQueryLast = "xPathQueryLast";
}
