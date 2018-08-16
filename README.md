# XML Tools for Visual Studio Code
[![Visual Studio Marketplace](https://img.shields.io/vscode-marketplace/v/DotJoshJohnson.xml.svg?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=DotJoshJohnson.xml)
[![Visual Studio Marketplace](https://img.shields.io/vscode-marketplace/r/DotJoshJohnson.xml.svg?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=DotJoshJohnson.xml)  

[![](https://img.shields.io/badge/TWITTER-%40DotJohnson-blue.svg?logo=twitter&style=for-the-badge)](https://twitter.com/DotJoshJohnson)
[![](https://img.shields.io/badge/gitter-join_chat-1dce73.svg?style=for-the-badge&logo=gitter-white)](https://gitter.im/vscode-xml/vscode-xml)
[![Beerpay](https://img.shields.io/beerpay/DotJoshJohnson/vscode-xml.svg?style=for-the-badge)](https://beerpay.io/DotJoshJohnson/vscode-xml)

## Features
* [XML Formatting](https://github.com/DotJoshJohnson/vscode-xml/wiki/xml-formatting)
* [XML Tree View](https://github.com/DotJoshJohnson/vscode-xml/wiki/xml-tree-view)
* [XPath Evaluation](https://github.com/DotJoshJohnson/vscode-xml/wiki/xpath-evaluation)
* [XQuery Linting](https://github.com/DotJoshJohnson/vscode-xml/wiki/xquery-linting)
* [XQuery Execution](https://github.com/DotJoshJohnson/vscode-xml/wiki/xquery-script-execution)
* [XQuery Code Completion](https://github.com/DotJoshJohnson/vscode-xml/wiki/xquery-code-completion)

## Requirements
* VS Code `1.22.2` or higher

## Extension Settings
* **`xmlTools.enableXmlTreeView`:** Enables the XML Tree View for XML documents.
* **`xmlTools.enableXmlTreeViewMetadata`:** Enables attribute and child element counts in the XML Document view.
* **`xmlTools.enableXmlTreeViewCursorSync`:** Enables auto-reveal of elements in the XML Document view when a start tag is clicked in the editor.
* **`xmlTools.enforcePrettySelfClosingTagOnFormat`:** Ensures a space is added before the forward slash at the end of a self-closing tag.
* **`xmlTools.ignoreDefaultNamespace`:** Ignore default xmlns attributes when evaluating XPath.
* **`xmlTools.persistXPathQuery`:** Remember the last XPath query used.
* **`xmlTools.removeCommentsOnMinify`:** Remove XML comments during minification.
* **`xmlTools.splitAttributesOnFormat`:** Put each attribute on a new line when formatting XML. Overrides `xmlTools.splitXmlnsOnFormat` if set to `true`. (V2 Formatter Only)
* **`xmlTools.splitXmlnsOnFormat`:** Put each xmlns attribute on a new line when formatting XML.
* **`xmlTools.xmlFormatterImplementation`:** Supported XML Formatters: `classic`, `v2`.
* **`xmlTools.xqueryExecutionArguments`:** Arguments to be passed to the XQuery execution engine.
* **`xmlTools.xqueryExecutionEngine`:** The full path to the executable to run when executing XQuery scripts.

## Release Notes
Detailed release notes are available [here](https://github.com/DotJoshJohnson/vscode-xml/releases).

## Issues
Run into a bug? Report it [here](https://github.com/DotJoshJohnson/vscode-xml/issues).

## Icon Credits
Icons used in the XML Tree View are used under the Creative Commons 3.0 BY license.
* "Code" icon by Dave Gandy from www.flaticon.com
* "At" icon by FreePik from www.flaticon.com
