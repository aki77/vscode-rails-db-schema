import { DefinitionProvider, TextDocument, Position, Location } from "vscode";
import { tableize } from "inflection";
import Schema from "./Schema";

const METHOD_PETTERN = /(?:(\w+)\.)?(\w+)(?:[^.\w]|$)/;

export default class SchemaDefinitionProvider implements DefinitionProvider {
  constructor(private schema: Schema) {}

  public provideDefinition(document: TextDocument, position: Position) {
    const range = document.getWordRangeAtPosition(position, METHOD_PETTERN);
    if (!range) {
      return;
    }

    const text = document.getText(range);
    const matches = text.match(METHOD_PETTERN);
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
    const colmun = table.columns.get(columnName);
    if (!colmun) {
      return;
    }

    return [
      {
        originSelectionRange,
        targetUri: this.schema.getUri(),
        targetRange: colmun.range
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
