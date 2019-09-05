import { CompletionItem, CompletionItemKind, MarkdownString } from "vscode";
import { Table } from "./Parser";

export default function buildCompletionItems(table: Table): CompletionItem[] {
  return Array.from(table.columns.values()).map(colmun => {
    const markdown = ["```ruby", colmun.lineText, "```"].join("\n");
    const item = new CompletionItem(colmun.name, CompletionItemKind.Method);
    item.detail = table.className;
    item.documentation = new MarkdownString(markdown);
    return item;
  });
}
