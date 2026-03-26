export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
}

export interface Checkout {
  id: string;
  bookId: string;
  memberId: string;
  checkedOutDate: string; // ISO date string
  dueDate: string;        // ISO date string
  returnedDate?: string;  // ISO date string, undefined = still checked out
}
