# Work Item REST Request Button

![image](restbutton-128.png)

This extension adds a custom control for work items with a button that sends a REST request.

## Dependencies

The repository depends on a few Azure DevOps packages:

- [azure-devops-extension-sdk](https://github.com/Microsoft/azure-devops-extension-sdk): Required module for Azure DevOps extensions which allows communication between the host page and the extension iframe.
- [azure-devops-extension-api](https://github.com/Microsoft/azure-devops-extension-api): Contains REST client libraries for the various Azure DevOps feature areas.
- [azure-devops-ui](https://developer.microsoft.com/azure-devops): UI library containing the React components used in the Azure DevOps web UI.

Some external dependencies:

- `React` - Is used to render the UI in the samples, and is a dependency of `azure-devops-ui`.
- `TypeScript` - Samples are written in TypeScript and compiled to JavaScript
- `SASS` - Extension samples are styled using SASS (which is compiled to CSS and delivered in webpack js bundles).
- `webpack` - Is used to gather dependencies into a single javascript bundle for each sample.

## Debugging the project

- See [Azure DevOps Extension Hot Reload and Debug](https://github.com/microsoft/azure-devops-extension-hot-reload-and-debug)

## Building the project

Just run:

    npm run build

This produces a .vsix file which can be uploaded to the [Visual Studio Marketplace](https://marketplace.visualstudio.com/azuredevops)

## Usage

In your project settings, under `Boards > Process > [ Your work item type of choice ]`, you can add a custom control. A window like this should appear:

![image](https://user-images.githubusercontent.com/26248881/200289881-f69ed5a3-9d08-46fd-8a54-bcdc70d752ac.png)

You need to configure a few mandatory settings:

![image](https://user-images.githubusercontent.com/26248881/200291346-2cd378b4-2003-4c77-9cfe-7fb04a804c9d.png)
