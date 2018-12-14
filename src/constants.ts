export namespace commands {
    export const evaluateXPath = "xmlTools.evaluateXPath";
    export const executeXQuery = "xmlTools.executeXQuery";
    export const formatAsXml = "xmlTools.formatAsXml";
    export const xmlToText = "xmlTools.xmlToText";
    export const textToXml = "xmlTools.textToXml";
    export const getCurrentXPath = "xmlTools.getCurrentXPath";
    export const minifyXml = "xmlTools.minifyXml";
}

export namespace contextKeys {
    export const xmlTreeViewEnabled = "xmlTreeViewEnabled";
}

export namespace diagnosticCollections {
    export const xquery = "XQueryDiagnostics";
}

export namespace languageIds {
    export const xml = "xml";
    export const xsd = "xsd";
    export const xquery = "xquery";
}

export namespace nativeCommands {
    export const revealLine = "revealLine";
}

export namespace stateKeys {
    export const xpathQueryHistory = "xpathQueryHistory";
    export const xPathQueryLast = "xPathQueryLast";
}

export namespace uriSchemes {
    export const file = "file";
    export const untitled = "untitled";
}

export namespace views {
    export const xmlTreeView = "xmlTreeView";
}

export namespace xmlFormatterImplementations {
    export const classic = "classic";
    export const v2 = "v2";
}
