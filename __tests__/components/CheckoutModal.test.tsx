import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CheckoutModal from "@/components/CheckoutModal";
import { Book, Member } from "@/lib/types";

const book: Book = {
  id: "b1",
  title: "Clean Code",
  author: "Robert C. Martin",
  isbn: "978-0132350884",
};

const members: Member[] = [
  { id: "m1", name: "Alice Johnson", email: "alice@example.com" },
  { id: "m2", name: "Bob Smith", email: "bob@example.com" },
];

describe("CheckoutModal", () => {
  it("renders the book title and author", () => {
    render(
      <CheckoutModal
        book={book}
        members={members}
        onConfirm={jest.fn()}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByText("Clean Code")).toBeInTheDocument();
    expect(screen.getByText(/Robert C. Martin/)).toBeInTheDocument();
  });

  it("renders all members in the select", () => {
    render(
      <CheckoutModal
        book={book}
        members={members}
        onConfirm={jest.fn()}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByRole("option", { name: /Alice Johnson/ })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Bob Smith/ })).toBeInTheDocument();
  });

  it("Confirm Checkout button is disabled when no member is selected", () => {
    render(
      <CheckoutModal
        book={book}
        members={members}
        onConfirm={jest.fn()}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /confirm checkout/i })).toBeDisabled();
  });

  it("Confirm Checkout button enables after selecting a member", async () => {
    render(
      <CheckoutModal
        book={book}
        members={members}
        onConfirm={jest.fn()}
        onClose={jest.fn()}
      />
    );
    await userEvent.selectOptions(
      screen.getByRole("combobox"),
      screen.getByRole("option", { name: /Alice Johnson/ })
    );
    expect(screen.getByRole("button", { name: /confirm checkout/i })).toBeEnabled();
  });

  it("calls onConfirm with memberId and ISO dates when confirmed", async () => {
    const onConfirm = jest.fn();
    render(
      <CheckoutModal
        book={book}
        members={members}
        onConfirm={onConfirm}
        onClose={jest.fn()}
      />
    );
    await userEvent.selectOptions(
      screen.getByRole("combobox"),
      screen.getByRole("option", { name: /Alice Johnson/ })
    );
    await userEvent.click(screen.getByRole("button", { name: /confirm checkout/i }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    const [memberId, checkedOutDate, dueDate] = onConfirm.mock.calls[0];
    expect(memberId).toBe("m1");
    expect(checkedOutDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // Due date should be 14 days after checkout date
    const diff =
      (new Date(dueDate).getTime() - new Date(checkedOutDate).getTime()) /
      (1000 * 60 * 60 * 24);
    expect(diff).toBe(14);
  });

  it("calls onClose when Cancel is clicked", async () => {
    const onClose = jest.fn();
    render(
      <CheckoutModal
        book={book}
        members={members}
        onConfirm={jest.fn()}
        onClose={onClose}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onConfirm when no member is selected and confirm is clicked", async () => {
    const onConfirm = jest.fn();
    render(
      <CheckoutModal
        book={book}
        members={members}
        onConfirm={onConfirm}
        onClose={jest.fn()}
      />
    );
    // Button is disabled, so clicking should not fire
    const confirmBtn = screen.getByRole("button", { name: /confirm checkout/i });
    await userEvent.click(confirmBtn);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
