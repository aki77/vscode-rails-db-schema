import { tableize } from "inflection";
import { CompletionItemProvider, TextDocument, Position, Range } from "vscode";
import buildCompletionItems from "./buildCompletionItems";
import Schema from "./Schema";

const MODEL_FILENAME_PATTERN = /\/app\/models\/.*\.rb$/;
const METHOD_ARGS_PATTERN = /(\w+)\.human_attribute_name[\s(]:$/;

export default class SymbolCompletionProvider
  implements CompletionItemProvider {
  constructor(private schema: Schema) {}

  public provideCompletionItems(document: TextDocument, position: Position) {
    const lineText = document
      .getText(
        new Range(
          new Position(position.line, 0),
          new Position(position.line, position.character)
        )
      )
      .trim();

    if (
      MODEL_FILENAME_PATTERN.test(document.fileName) &&
      lineText === "validates :"
    ) {
      const table = this.schema.getTableByFileName(document.fileName);
      return table ? buildCompletionItems(table) : undefined;
    }

    const matches = lineText.match(METHOD_ARGS_PATTERN);
    if (!matches) {
      return;
    }

    const tableName = tableize(matches[1]);
    const table = this.schema.getTable(tableName);
    return table ? buildCompletionItems(table) : undefined;
  }
}
