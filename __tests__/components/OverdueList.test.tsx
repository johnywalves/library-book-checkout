import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OverdueList from "@/components/OverdueList";
import { Book, Checkout, Member } from "@/lib/types";

const books: Book[] = [
  { id: "b1", title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884" },
  { id: "b2", title: "The Hobbit", author: "J.R.R. Tolkien", isbn: "978-0547928227" },
];

const members: Member[] = [
  { id: "m1", name: "Alice Johnson", email: "alice@example.com" },
  { id: "m2", name: "Bob Smith", email: "bob@example.com" },
];

// Fixed "now" to 2026-03-31 for deterministic overdue calculations
const FIXED_NOW = new Date("2026-03-31T12:00:00").getTime();

describe("OverdueList", () => {
  beforeEach(() => {
    jest.spyOn(Date, "now").mockReturnValue(FIXED_NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("with no overdue checkouts", () => {
    it("shows empty state message", () => {
      const futureCheckout: Checkout = {
        id: "c1",
        bookId: "b1",
        memberId: "m1",
        checkedOutDate: "2026-03-25",
        dueDate: "2026-04-08",
      };
      render(
        <OverdueList
          checkouts={[futureCheckout]}
          books={books}
          members={members}
          onReturn={jest.fn()}
        />
      );
      expect(screen.getByText(/no overdue checkouts/i)).toBeInTheDocument();
    });

    it("shows empty state for empty checkouts array", () => {
      render(
        <OverdueList
          checkouts={[]}
          books={books}
          members={members}
          onReturn={jest.fn()}
        />
      );
      expect(screen.getByText(/no overdue checkouts/i)).toBeInTheDocument();
    });
  });

  describe("with overdue checkouts", () => {
    const overdueCheckouts: Checkout[] = [
      {
        id: "c1",
        bookId: "b1",
        memberId: "m1",
        checkedOutDate: "2026-02-24",
        dueDate: "2026-03-10", // 21 days overdue from 2026-03-31
      },
      {
        id: "c2",
        bookId: "b2",
        memberId: "m2",
        checkedOutDate: "2026-03-01",
        dueDate: "2026-03-15", // 16 days overdue from 2026-03-31
      },
    ];

    it("renders a row for each overdue checkout", () => {
      render(
        <OverdueList
          checkouts={overdueCheckouts}
          books={books}
          members={members}
          onReturn={jest.fn()}
        />
      );
      expect(screen.getByText("Clean Code")).toBeInTheDocument();
      expect(screen.getByText("The Hobbit")).toBeInTheDocument();
    });

    it("shows borrower names", () => {
      render(
        <OverdueList
          checkouts={overdueCheckouts}
          books={books}
          members={members}
          onReturn={jest.fn()}
        />
      );
      expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
      expect(screen.getByText("Bob Smith")).toBeInTheDocument();
    });

    it("shows days overdue", () => {
      render(
        <OverdueList
          checkouts={overdueCheckouts}
          books={books}
          members={members}
          onReturn={jest.fn()}
        />
      );
      expect(screen.getByText(/21 days overdue/i)).toBeInTheDocument();
      expect(screen.getByText(/16 days overdue/i)).toBeInTheDocument();
    });

    it("uses singular 'day' for exactly 1 day overdue", () => {
      const oneDayOverdue: Checkout = {
        id: "c3",
        bookId: "b1",
        memberId: "m1",
        checkedOutDate: "2026-03-16",
        dueDate: "2026-03-30", // 1 day overdue from 2026-03-31
      };
      render(
        <OverdueList
          checkouts={[oneDayOverdue]}
          books={books}
          members={members}
          onReturn={jest.fn()}
        />
      );
      expect(screen.getByText(/1 day overdue/i)).toBeInTheDocument();
    });

    it("renders a Return button for each overdue checkout", () => {
      render(
        <OverdueList
          checkouts={overdueCheckouts}
          books={books}
          members={members}
          onReturn={jest.fn()}
        />
      );
      const returnButtons = screen.getAllByRole("button", { name: /return/i });
      expect(returnButtons).toHaveLength(2);
    });

    it("calls onReturn with the correct checkout when Return is clicked", async () => {
      const onReturn = jest.fn();
      render(
        <OverdueList
          checkouts={overdueCheckouts}
          books={books}
          members={members}
          onReturn={onReturn}
        />
      );
      const [firstReturnBtn] = screen.getAllByRole("button", { name: /return/i });
      await userEvent.click(firstReturnBtn);
      expect(onReturn).toHaveBeenCalledWith(overdueCheckouts[0]);
    });

    it("does not render returned checkouts", () => {
      const returned: Checkout = {
        id: "c3",
        bookId: "b1",
        memberId: "m1",
        checkedOutDate: "2026-02-01",
        dueDate: "2026-02-15",
        returnedDate: "2026-02-14",
      };
      render(
        <OverdueList
          checkouts={[returned]}
          books={books}
          members={members}
          onReturn={jest.fn()}
        />
      );
      expect(screen.getByText(/no overdue checkouts/i)).toBeInTheDocument();
    });
  });
});
