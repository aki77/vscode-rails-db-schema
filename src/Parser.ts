import { TextDocument, Range } from "vscode";
import { classify } from "inflection";

interface Column {
  name: string;
  type: string;
  comment?: string;
  lineText: string;
  range: Range;
}

export interface Table {
  line: number;
  className: string;
  tableName: string;
  columns: Map<string, Column>;
}

const CREATE_TABLE_REGEX = /\screate_table\s"(\w+)"/;
const END_TABLE_REGEX = /^\s+end$/;
const COLUMN_REGEXP = /t\.(\w+)\s+"(\w+)".*?(?:,\s+comment:\s+"([^"]*)")?/;

export default class Parser {
  constructor(private document: TextDocument) {}

  public *parseTables() {
    let table: Partial<Table> = {};

    for (const line of this.documentLines(this.document)) {
      const text = line.text;

      if (text.trimLeft().startsWith("create_table")) {
        const matches = text.match(CREATE_TABLE_REGEX);
        const tableName = matches![1];
        table.line = line.lineNumber;
        table.className = classify(tableName);
        table.tableName = tableName;
        table.columns = new Map();

        continue;
      }

      if (text.match(END_TABLE_REGEX)) {
        yield table as Table;
        table = {};
        continue;
      }

      const matches = text.match(COLUMN_REGEXP);
      if (matches) {
        const [, type, name, comment] = matches;
        const column: Column = {
          type,
          name,
          comment,
          lineText: text.trim(),
          range: line.range
        };
        table.columns!.set(name, column);
      }
    }
  }

  private *documentLines(document: TextDocument) {
    const lineCount = document.lineCount;
    for (let i = 0; i < lineCount; i++) {
      yield document.lineAt(i);
    }
  }
}
