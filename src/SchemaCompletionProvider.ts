import {
  CompletionItemProvider,
  TextDocument,
  Position,
  CompletionItem,
  CompletionItemKind,
  MarkdownString,
  Range
} from "vscode";
import { tableize } from "inflection";
import Schema from "./Schema";

const LINE_PETTERN = /(?:(\w+)\.|\W\w+)$/;

export default class SchemaCompSchemaletionProvider
  implements CompletionItemProvider {
  constructor(private schema: Schema) {}

  public provideCompletionItems(document: TextDocument, position: Position) {
    const text = document.getText(
      new Range(
        new Position(position.line, 0),
        new Position(position.line, position.character)
      )
    );
    const matches = text.match(LINE_PETTERN);
    if (!matches) {
      return;
    }

    const [, receiver] = matches;

    if (!receiver || receiver === "self") {
      const tableName = this.schema.getTableNameByFileName(document.fileName);
      return tableName ? this.buildCompletionItems(tableName) : null;
    }

    const tableName = tableize(receiver);
    return this.buildCompletionItems(tableName);
  }

  private buildCompletionItems(tableName: string): CompletionItem[] {
    const table = this.schema.getTable(tableName);
    if (!table) {
      return [];
    }

    return Array.from(table.columns.values()).map(colmun => {
      const markdown = ["```ruby", colmun.lineText, "```"].join("\n");
      const item = new CompletionItem(colmun.name, CompletionItemKind.Method);
      item.detail = table.className;
      item.documentation = new MarkdownString(markdown);
      return item;
    });
  }
}
