import Schema from "./Schema";
import {
  window,
  Position,
  Selection,
  TextEditorRevealType,
  QuickPick,
  QuickPickItem
} from "vscode";

export default class Commands {
  private quickPick: QuickPick<QuickPickItem>;

  constructor(private schema: Schema) {
    this.quickPick = window.createQuickPick();
    this.quickPick.onDidAccept(this.accept);
    this.quickPick.totalSteps = 2;
  }

  public async open(tableName?: string) {
    if (tableName) {
      await this.openSchema(tableName);
      return;
    }

    const selected = await window.showQuickPick(this.schema.getTableNames());
    if (!selected) {
      return;
    }
    await this.openSchema(selected);
  }

  public async insert() {
    const items = this.schema
      .getTableNames()
      .map(tableName => ({ label: tableName }));

    this.quickPick.busy = true;
    this.quickPick.value = "";
    this.quickPick.placeholder = "Select a Table";
    this.quickPick.step = 1;
    this.quickPick.show();
    this.quickPick.items = [...items].sort((a, b) => a.label.localeCompare(b.label));
    this.quickPick.busy = false;
  }

  private async openSchema(tableName: string) {
    const table = this.schema.getTable(tableName);
    if (!table) {
      return;
    }

    const editor = await window.showTextDocument(this.schema.getUri());
    const position = new Position(table.line, 0);
    editor.selection = new Selection(position, position);
    editor.revealRange(editor.selection, TextEditorRevealType.InCenter);
  }

  private async showColumns(tableName: string) {
    const table = this.schema.getTable(tableName);
    if (!table) {
      return;
    }

    const items = Array.from(table.columns.values()).map(column => ({
      label: column.name,
      description: column.lineText
    }));

    this.quickPick.busy = true;
    this.quickPick.value = "";
    this.quickPick.step = 2;
    this.quickPick.placeholder = "Select a Column";
    this.quickPick.items = [...items].sort((a, b) => a.label.localeCompare(b.label));
    this.quickPick.busy = false;
  }

  private async insertColumn(column: string) {
    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    this.quickPick.hide();
    await editor.edit(edit => {
      if (editor.selection.isEmpty) {
        edit.insert(editor.selection.active, column);
      } else {
        edit.replace(editor.selection, column);
      }
    });
  }

  private accept = () => {
    const selectedItem = this.quickPick.selectedItems[0];

    if (this.quickPick.step === 1) {
      this.showColumns(selectedItem.label);
    } else {
      this.insertColumn(selectedItem.label);
    }
  };
}
