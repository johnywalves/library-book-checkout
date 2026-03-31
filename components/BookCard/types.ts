import { Book, Checkout, Member } from "@/lib/types";

export interface BookCardProps {
  book: Book;
  checkouts: Checkout[];
  members: Member[];
  onCheckout: (book: Book) => void;
  onReturn: (checkout: Checkout) => void;
}
