const vscode = require('vscode')
const fs = require('fs')

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    'test-id-generator.addTestDataAttributes',
    () => {
      addTestDataAttributes()
    }
  )

  context.subscriptions.push(disposable)

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'test-id-generator.addTestDataAttributesKeybinding',
      () => {
        addTestDataAttributes()
      }
    )
  )
}

function addTestDataAttributes() {
  const editor = vscode.window.activeTextEditor
  if (editor) {
    const document = editor.document
    const text = document.getText()

    const extensionPath = vscode.extensions.getExtension(
      'omeerdvrn.test-id-generator'
    ).extensionPath

    // Get the user-configured configPath or use the default value
    const configPath =
      vscode.workspace.workspaceFolders[0].uri.fsPath.concat('/.testidrc.json')

    console.log('Extension Path:', extensionPath)
    console.log('Config Path:', configPath)

    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8')
      const config = JSON.parse(configData)

      const attributeKeyword = config.attributeKeyword || 'data-test'

      let modifiedText = text.replace(
        /<([-\w]+)(?:[^>]*\sid=["'](.*?)["'])?[^>]*>/g,
        (match, elementName, elementId) => {
          console.log('Element Name:', elementName)
          console.log('Element ID:', elementId)

          if (config.ignoreElements.includes(elementName)) {
            return match
          }

          const testId = elementId
            ? elementId
            : elementName.concat('-' + config.defaultTestId)

          console.log('Test ID:', testId)
          if (elementId) {
            return `<${elementName} id="${elementId}" ${attributeKeyword}="${testId}">`
          } else return `<${elementName} ${attributeKeyword}="${testId}">`
        }
      )

      editor.edit(editBuilder => {
        const entireDocument = new vscode.Range(
          document.positionAt(0),
          document.positionAt(text.length)
        )
        editBuilder.replace(entireDocument, modifiedText)
      })
    } else {
      vscode.window.showErrorMessage(
        'Config or ignoreElements file not found. Create ".testidrc.json" file in your extension project.'
      )
    }
  } else {
    vscode.window.showErrorMessage('No active text editor found.')
  }
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}
