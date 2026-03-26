import { Book, Member, Checkout } from "./types";

export const BOOKS: Book[] = [
  { id: "b1", title: "The Pragmatic Programmer", author: "Andrew Hunt & David Thomas", isbn: "978-0135957059" },
  { id: "b2", title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884" },
  { id: "b3", title: "Design Patterns", author: "Gang of Four", isbn: "978-0201633610" },
  { id: "b4", title: "The Hobbit", author: "J.R.R. Tolkien", isbn: "978-0547928227" },
  { id: "b5", title: "Dune", author: "Frank Herbert", isbn: "978-0441013593" },
  { id: "b6", title: "1984", author: "George Orwell", isbn: "978-0451524935" },
];

export const MEMBERS: Member[] = [
  { id: "m1", name: "Alice Johnson", email: "alice@example.com" },
  { id: "m2", name: "Bob Smith", email: "bob@example.com" },
  { id: "m3", name: "Carol White", email: "carol@example.com" },
  { id: "m4", name: "David Brown", email: "david@example.com" },
];

// Today for reference: 2026-03-26
// Overdue: checked out 30 days ago, due 16 days ago
// Active: checked out 5 days ago, due in 9 days
export const CHECKOUTS: Checkout[] = [
  {
    id: "c1",
    bookId: "b2",
    memberId: "m1",
    checkedOutDate: "2026-02-24",
    dueDate: "2026-03-10", // overdue
  },
  {
    id: "c2",
    bookId: "b4",
    memberId: "m3",
    checkedOutDate: "2026-03-01",
    dueDate: "2026-03-15", // overdue
  },
  {
    id: "c3",
    bookId: "b5",
    memberId: "m2",
    checkedOutDate: "2026-03-21",
    dueDate: "2026-04-04", // active
  },
  {
    id: "c4",
    bookId: "b1",
    memberId: "m4",
    checkedOutDate: "2026-03-20",
    dueDate: "2026-04-03", // active
    returnedDate: "2026-03-25", // already returned — available again
  },
];
