import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BookCard from "@/components/BookCard";
import { Book, Checkout, Member } from "@/lib/types";

const book: Book = {
  id: "b1",
  title: "The Pragmatic Programmer",
  author: "Andrew Hunt & David Thomas",
  isbn: "978-0135957059",
};

const members: Member[] = [
  { id: "m1", name: "Alice Johnson", email: "alice@example.com" },
];

describe("BookCard", () => {
  describe("available book", () => {
    it("displays book info", () => {
      render(
        <BookCard
          book={book}
          checkouts={[]}
          members={members}
          onCheckout={jest.fn()}
          onReturn={jest.fn()}
        />
      );
      expect(screen.getByText("The Pragmatic Programmer")).toBeInTheDocument();
      expect(screen.getByText("Andrew Hunt & David Thomas")).toBeInTheDocument();
      expect(screen.getByText(/978-0135957059/)).toBeInTheDocument();
    });

    it("shows Available badge", () => {
      render(
        <BookCard
          book={book}
          checkouts={[]}
          members={members}
          onCheckout={jest.fn()}
          onReturn={jest.fn()}
        />
      );
      expect(screen.getByText("Available")).toBeInTheDocument();
    });

    it("shows Check Out button", () => {
      render(
        <BookCard
          book={book}
          checkouts={[]}
          members={members}
          onCheckout={jest.fn()}
          onReturn={jest.fn()}
        />
      );
      expect(screen.getByRole("button", { name: /check out/i })).toBeInTheDocument();
    });

    it("calls onCheckout with the book when Check Out is clicked", async () => {
      const onCheckout = jest.fn();
      render(
        <BookCard
          book={book}
          checkouts={[]}
          members={members}
          onCheckout={onCheckout}
          onReturn={jest.fn()}
        />
      );
      await userEvent.click(screen.getByRole("button", { name: /check out/i }));
      expect(onCheckout).toHaveBeenCalledWith(book);
    });
  });

  describe("checked-out book", () => {
    const activeCheckout: Checkout = {
      id: "c1",
      bookId: "b1",
      memberId: "m1",
      checkedOutDate: "2026-03-25",
      dueDate: "2026-04-08",
    };

    it("shows Checked Out badge", () => {
      render(
        <BookCard
          book={book}
          checkouts={[activeCheckout]}
          members={members}
          onCheckout={jest.fn()}
          onReturn={jest.fn()}
        />
      );
      expect(screen.getByText("Checked Out")).toBeInTheDocument();
    });

    it("displays borrower name and due date", () => {
      render(
        <BookCard
          book={book}
          checkouts={[activeCheckout]}
          members={members}
          onCheckout={jest.fn()}
          onReturn={jest.fn()}
        />
      );
      expect(screen.getByText(/Alice Johnson/)).toBeInTheDocument();
      expect(screen.getByText(/Apr\s+8,\s+2026/)).toBeInTheDocument();
    });

    it("shows Return Book button", () => {
      render(
        <BookCard
          book={book}
          checkouts={[activeCheckout]}
          members={members}
          onCheckout={jest.fn()}
          onReturn={jest.fn()}
        />
      );
      expect(screen.getByRole("button", { name: /return book/i })).toBeInTheDocument();
    });

    it("calls onReturn with the checkout when Return Book is clicked", async () => {
      const onReturn = jest.fn();
      render(
        <BookCard
          book={book}
          checkouts={[activeCheckout]}
          members={members}
          onCheckout={jest.fn()}
          onReturn={onReturn}
        />
      );
      await userEvent.click(screen.getByRole("button", { name: /return book/i }));
      expect(onReturn).toHaveBeenCalledWith(activeCheckout);
    });
  });

  describe("overdue book", () => {
    const overdueCheckout: Checkout = {
      id: "c1",
      bookId: "b1",
      memberId: "m1",
      checkedOutDate: "2026-02-01",
      dueDate: "2026-02-15",
    };

    it("shows Overdue badge", () => {
      render(
        <BookCard
          book={book}
          checkouts={[overdueCheckout]}
          members={members}
          onCheckout={jest.fn()}
          onReturn={jest.fn()}
        />
      );
      expect(screen.getByText("Overdue")).toBeInTheDocument();
    });

    it("shows overdue message", () => {
      render(
        <BookCard
          book={book}
          checkouts={[overdueCheckout]}
          members={members}
          onCheckout={jest.fn()}
          onReturn={jest.fn()}
        />
      );
      expect(screen.getByText(/overdue since/i)).toBeInTheDocument();
    });
  });
});
