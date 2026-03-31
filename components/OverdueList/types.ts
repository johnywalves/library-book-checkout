import { Checkout, Book, Member } from "@/lib/types";

export interface OverdueListProps {
  checkouts: Checkout[];
  books: Book[];
  members: Member[];
  onReturn: (checkout: Checkout) => void;
}
