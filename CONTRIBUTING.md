# Contribution Guide
Thanks for helping out! This guide provides some guidelines on coding styles and architecture for this extension.
Keep in mind that these are guidelines, not rules. Use your best judgement and feel free to make suggestions!

## Building the Extension
1. Clone the repository locally and run `npm install` from the vscode-xml directory.
2. Run the `build` task in VS Code (`CTRL + SHIFT + B`) or start extension debugging (`F5`), which will run the `build` task for you.

## Pull Requests
If you would like to work on an unassigned issue, please:

1. Comment on the issue so others are aware of your intentions.
2. Make a fork of the repository and create a branch named `issue-#<issue_number>`.
3. When finished, create a pull request using the issue branch.

If you would like to add unsolicited features, please:

1. Make a fork of the repository and create a branch named `wip-<my_new_feature>`.
2. Create a pull request using the WIP branch and prefix the name of the PR with "WIP".
3. The pull request will be used as the channel of communication for discussion around the new feature. Once code is complete, the PR will be treated as per normal.

## Style Guide
In short, favor clean, maintainable code over code that "just works".

### Imports
To keep *.ts files from getting too cluttered, use a namespace alias when pulling in more than 4 or 5 objects. As a general rule, always import the `vscode` namespace using the `vsc` alias for consistency.

**Favor This**

`import * as abc from 'abclib';`

**Over This**

`import { SomeType, AnotherType, BigClassWithCrazyName, IwantThisToo, VeryAppealingClass, Gimmee } from 'abclib';`

### Static Classes
When possible, try to use a static class to wrap utility functions so you are importing the class, not just a function.
For libraries that do not follow this construct (such as the `xpath` module), *always* import the module using an alias (`import * as xpath from 'xpath').

### Constants
Where applicable, try to use constants instead of inline strings and numbers.

## Implicit Types
Moving forward, the compiler is instructed (via tsconfig.json) to throw warnings if any expressions imply an "any" type. In other words, always use type declarations where applicable so it is clear what type is being used.
There is an exception to this guideline. If you are using a thrid party library that does not have a *.d.ts file available, you do not need to write one. Just ensure the API is documented (either in this repo or in the library's repo).


## Folder Structure
All TypeScript files should reside under the top `src` folder. Under this, there are several subfolders and top-level files defined below:

### providers
This folder contains any classes that implement provider interfaces from the `vscode` namespace. This folder also contains any code that works directly with the
APIs exposed by the `vscode` namespace, such as user interaction or configuration access. Aside for the `vscode` module, no code in this folder should be dependent on
any external NodeJS modules or libraries.

### services
This folder contains any classes that perform actions/logic required by the providers mentioned above. Services should not be dependent on the `vscode` namespace and *can* be
dependent on external Node modules and libraries.

### utils
This folder contains any utility classes/functions that might be used by providers.

### Commands.ts
This file acts as an interface to all registered commands in the extension. If a substantial amount of code is required to implement a command, it should be moved to a provider and/or service.
Otherwise, if a command can be implemented in just a few lines, that code can be placed here.

### Extension.ts
Previously named `main.ts`, this is the primary entry point to the extension. Anything that needs done on activation or deactivation of the extension is done here. Both the workspace
and global `Memento` instances are exposed from this module, which can be used by providers as needed.