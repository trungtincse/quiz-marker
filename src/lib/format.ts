export function formatDate(d: Date) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(d);
}

export function percent(score: number, total: number) {
  return total ? Math.round((score / total) * 100) : 0;
}

export const LETTERS = ["A", "B", "C", "D", "E", "F"];
