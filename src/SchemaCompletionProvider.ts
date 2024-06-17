import { CompletionItemProvider, TextDocument, Position, Range } from "vscode";
import { tableize } from "inflection";
import Schema from "./Schema";
import buildCompletionItems from "./buildCompletionItems";

const LINE_PATTERN = /(?:(\w+)\.|\W\w+)$/;

export default class SchemaCompletionProvider
  implements CompletionItemProvider {
  constructor(private schema: Schema) {}

  public provideCompletionItems(document: TextDocument, position: Position) {
    const text = document.getText(
      new Range(
        new Position(position.line, 0),
        new Position(position.line, position.character)
      )
    );
    const matches = text.match(LINE_PATTERN);
    if (!matches) {
      return;
    }

    const [, receiver] = matches;

    if (!receiver || receiver === "self") {
      const table = this.schema.getTableByFileName(document.fileName);
      return table ? buildCompletionItems(table) : null;
    }

    const tableName = tableize(receiver);
    const table = this.schema.getTable(tableName);
    return table ? buildCompletionItems(table) : null;
  }
}
