import { CompletionItemProvider, TextDocument, Position } from "vscode";
import buildCompletionItems from "./buildCompletionItems";
import Schema from "./Schema";

export default class ValidateCompSchemaletionProvider
  implements CompletionItemProvider {
  constructor(private schema: Schema) {}

  public provideCompletionItems(document: TextDocument, position: Position) {
    const lineText = document.lineAt(position.line).text;
    if (lineText.trim() !== "validates :") {
      return;
    }

    const table = this.schema.getTableByFileName(document.fileName);
    return table ? buildCompletionItems(table) : undefined;
  }
}
