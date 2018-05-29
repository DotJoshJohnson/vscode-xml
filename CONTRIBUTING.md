# Contributing to XML Tools
Welcome and thank you for contributing to **XML Tools for Visual Studio Code**! This document aims to provide an overview of standards and expectations for those interested in contributing to the project.

## Asking Questions
If you have any questions, please ask on Gitter or Twitter instead of submitting an issue.

## Reporting Issues
Before submitting a new issue, please be sure to check for an existing issue that matches yours first. Issues that are waiting for information for more than 30 days will be closed, so please be sure to follow your issues!

## Writing Code
If you would like to contribute code to the project, please follow these conventions:

* Use spaces over tabs (4 spaces per tab is preferred).
* Use double quotes whenever possible instead of single quotes.
* Use **snake-case** for file names.
* Use **PascalCase** for class and interface names.
* Use **camelCase** for all other identifiers unless otherwise specified.
* Prefix private members with an underscore.
* Implement and maintain barrels (`index.ts` files) when creating new folders or files.
* Use constants when referencing a static value more than once in your code.
* Place `else` and `else if` on their own lines.
* Never put opening braces (`{`) on their own line.
* Always use semicolons.
* Always prefer `const` whenever possible and fall back to `let` only if absolutely necessary.

### Branches and Pull Requests
Always develop on a new feature branch in your fork and submit pull requests from that branch to our master branch. Don't worry about changing any version numbers - that happens in its own PR before a release.

### Formatter Changes
For small bug fixes or feature additions, always add a new test case to accompany your change. If you are making large sweeping changes to how the formatter works or leveraging an external dependency for formatting XML, please create a new XmlFormatter implementation.
