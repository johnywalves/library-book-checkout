import { Book, Member } from "@/lib/types";

export interface CheckoutModalProps {
  book: Book;
  members: Member[];
  onConfirm: (memberId: string, checkedOutDate: string, dueDate: string) => void;
  onClose: () => void;
}
