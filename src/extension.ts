import * as vscode from "vscode";
import Schema from "./Schema";
import SchemaCompletionProvider from "./SchemaCompletionProvider";
import SchemaDefinitionProvider from "./SchemaDefinitionProvider";
import ValidateCompletionProvider from "./ValidateCompletionProvider";
import Commands from "./Commands";

const GLOB_PATTERN = "db/schema.rb";
const SELECTOR = ["ruby", "erb", "haml", "slim"];

export async function activate(context: vscode.ExtensionContext) {
  const schemaFiles = await vscode.workspace.findFiles(GLOB_PATTERN);
  if (schemaFiles.length < 1) {
    return;
  }

  const schemaFile = schemaFiles[0];

  const schema = new Schema(schemaFile);
  schema.load();
  context.subscriptions.push(schema);

  const fileWatcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(
      vscode.workspace.getWorkspaceFolder(schemaFile) as vscode.WorkspaceFolder,
      GLOB_PATTERN
    )
  );
  fileWatcher.onDidChange(() => {
    schema.load();
  });
  context.subscriptions.push(fileWatcher);

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      SELECTOR,
      new SchemaCompletionProvider(schema),
      "."
    )
  );

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      { pattern: "**/app/models/**/*.rb" },
      new ValidateCompletionProvider(schema),
      ":"
    )
  );

  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(
      SELECTOR,
      new SchemaDefinitionProvider(schema)
    )
  );

  const commands = new Commands(schema);

  context.subscriptions.push(
    vscode.commands.registerCommand("railsDbSchema.open", async (...args) => {
      await commands.open(...args);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("railsDbSchema.insert", async () => {
      await commands.insert();
    })
  );
}

export function deactivate() {}
