export const extensionPrefix = "xmlTools";

export namespace commands {
    export const evaluateXPath = "xmlTools.evaluateXPath";
    export const formatAsXml = "xmlTools.formatAsXml";
    export const minifyXml = "xmlTools.minifyXml";
}

export namespace contextKeys {
    export const xmlTreeViewEnabled = "xmlTreeViewEnabled";
}

export namespace configKeys {
    export const enableXmlTreeView = "enableXmlTreeView";
    export const ignoreDefaultNamespace = "ignoreDefaultNamespace";
    export const persistXPathQuery = "persistXPathQuery";
    export const removeCommentsOnMinify = "removeCommentsOnMinify";
    export const splitAttributesOnFormat = "splitAttributesOnFormat";
    export const splitXmlnsOnFormat = "splitXmlnsOnFormat";
}

export namespace diagnosticCollections {
    export const xquery = "XQueryDiagnostics";
}

export namespace languageIds {
    export const xml = "xml";
    export const xquery = "xquery";
}

export namespace nativeCommands {
    export const cursorMove = "cursorMove";
    export const revealLine = "revealLine";
    export const setContext = "setContext";
}

export namespace stateKeys {
    export const xpathQueryHistory = "xpathQueryHistory";
    export const xPathQueryLast = "xPathQueryLast";
}

export namespace views {
    export const xmlTreeView = "xmlTreeView";
}

export namespace xmlFormatterImplementations {
    export const classic = "classic";
    export const v2 = "v2";
}
