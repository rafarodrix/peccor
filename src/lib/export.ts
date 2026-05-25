/**
 * Escapes a CSV field value, wrapping in quotes if it contains commas, quotes, or newlines.
 */
function escapeCSVField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // If the field contains a comma, double-quote, or newline, wrap in quotes and escape inner quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts headers and rows into a CSV string.
 */
export function toCSV(
  headers: string[],
  rows: (string | number | null | undefined)[][]
): string {
  const lines: string[] = [];
  lines.push(headers.map(escapeCSVField).join(","));
  for (const row of rows) {
    lines.push(row.map(escapeCSVField).join(","));
  }
  return lines.join("\n");
}

/**
 * Triggers a CSV file download in the browser (client-side only).
 */
export function downloadCSV(filename: string, csv: string): void {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
