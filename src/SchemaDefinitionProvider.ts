import { DefinitionProvider, TextDocument, Position, Location } from "vscode";
import { tableize } from "inflection";
import Schema from "./Schema";

const METHOD_PATTERN = /(?:(\w+)\.)?(\w+)(?:[^.\w]|$)/;

export default class SchemaDefinitionProvider implements DefinitionProvider {
  constructor(private schema: Schema) {}

  public provideDefinition(document: TextDocument, position: Position) {
    const range = document.getWordRangeAtPosition(position, METHOD_PATTERN);
    if (!range) {
      return;
    }

    const text = document.getText(range);
    const matches = text.match(METHOD_PATTERN);
    if (!matches) {
      return;
    }

    const [, receiver, columnName] = matches;
    const table = this.getTable(receiver, document);
    if (!table) {
      return;
    }

    const originSelectionRange = receiver
      ? range.with(
          new Position(
            range.start.line,
            range.start.character + receiver.length + 1
          )
        )
      : range;
    const column = table.columns.get(columnName);
    if (!column) {
      return;
    }

    return [
      {
        originSelectionRange,
        targetUri: this.schema.getUri(),
        targetRange: column.range
      }
    ];
  }

  private getTable(receiver: string, document: TextDocument) {
    if (receiver && receiver !== "self") {
      return this.schema.getTable(tableize(receiver));
    }

    const tableName = this.schema.getTableNameByFileName(document.fileName);
    return tableName ? this.schema.getTable(tableName) : null;
  }
}
