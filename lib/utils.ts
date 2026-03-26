import { Checkout } from "./types";

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function isOverdue(checkout: Checkout): boolean {
  if (checkout.returnedDate) return false;
  return new Date(checkout.dueDate) < new Date(new Date().toDateString());
}

export function isCheckedOut(bookId: string, checkouts: Checkout[]): boolean {
  return checkouts.some(
    (c) => c.bookId === bookId && !c.returnedDate
  );
}

export function getActiveCheckout(bookId: string, checkouts: Checkout[]): Checkout | undefined {
  return checkouts.find((c) => c.bookId === bookId && !c.returnedDate);
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate + "T12:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
