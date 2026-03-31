import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomeView from "@/views/HomeView";
import { BOOKS, MEMBERS } from "@/lib/seed";

// Fixed date so seed overdue checkouts are deterministic
const FIXED_NOW = new Date("2026-03-31T12:00:00").getTime();

function getBookCard(title: string) {
  return screen.getByRole("heading", { name: title }).closest("div[class*='rounded-xl']") as HTMLElement;
}

describe("HomeView", () => {
  beforeEach(() => {
    jest.spyOn(Date, "now").mockReturnValue(FIXED_NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the page header", () => {
    render(<HomeView />);
    expect(screen.getByRole("heading", { name: /library checkout/i })).toBeInTheDocument();
  });

  it("shows member and book counts in the header", () => {
    render(<HomeView />);
    expect(screen.getByText(`${MEMBERS.length} members`)).toBeInTheDocument();
    expect(screen.getByText(`${BOOKS.length} books`)).toBeInTheDocument();
  });

  it("renders the Overdue Returns section", () => {
    render(<HomeView />);
    expect(screen.getByRole("heading", { name: /overdue returns/i })).toBeInTheDocument();
  });

  it("renders the Book Collection section", () => {
    render(<HomeView />);
    expect(screen.getByRole("heading", { name: /book collection/i })).toBeInTheDocument();
  });

  it("displays all books on initial render", () => {
    render(<HomeView />);
    const bookSection = screen.getByRole("heading", { name: /book collection/i }).closest("section")!;
    BOOKS.forEach((book) => {
      expect(within(bookSection).getAllByText(book.title).length).toBeGreaterThan(0);
    });
  });

  describe("tab filtering", () => {
    it("filters to available books when Available tab is clicked", async () => {
      render(<HomeView />);
      await userEvent.click(screen.getByRole("button", { name: /available/i }));
      const bookSection = screen.getByRole("heading", { name: /book collection/i }).closest("section")!;
      // Clean Code (b2) and The Hobbit (b4) are overdue/checked out; Dune (b5) is also checked out
      expect(within(bookSection).queryByText("Clean Code")).not.toBeInTheDocument();
      expect(within(bookSection).queryByText("The Hobbit")).not.toBeInTheDocument();
      expect(within(bookSection).queryByText("Dune")).not.toBeInTheDocument();
    });

    it("filters to checked-out books when Checked Out tab is clicked", async () => {
      render(<HomeView />);
      await userEvent.click(screen.getByRole("button", { name: /checked out/i }));
      const bookSection = screen.getByRole("heading", { name: /book collection/i }).closest("section")!;
      expect(within(bookSection).getByText("Clean Code")).toBeInTheDocument();
      expect(within(bookSection).getByText("The Hobbit")).toBeInTheDocument();
    });

    it("shows all books again when All tab is clicked", async () => {
      render(<HomeView />);
      await userEvent.click(screen.getByRole("button", { name: /checked out/i }));
      await userEvent.click(screen.getByRole("button", { name: /^all/i }));
      const bookSection = screen.getByRole("heading", { name: /book collection/i }).closest("section")!;
      BOOKS.forEach((book) => {
        expect(within(bookSection).getAllByText(book.title).length).toBeGreaterThan(0);
      });
    });
  });

  describe("checkout flow", () => {
    it("opens the checkout modal when Check Out is clicked", async () => {
      render(<HomeView />);
      // Design Patterns (b3) is available
      await userEvent.click(
        within(getBookCard("Design Patterns")).getByRole("button", { name: /check out/i })
      );
      expect(screen.getByRole("heading", { name: /check out book/i })).toBeInTheDocument();
    });

    it("closes the modal when Cancel is clicked", async () => {
      render(<HomeView />);
      await userEvent.click(
        within(getBookCard("Design Patterns")).getByRole("button", { name: /check out/i })
      );
      await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
      expect(screen.queryByRole("heading", { name: /check out book/i })).not.toBeInTheDocument();
    });

    it("marks a book as checked out after confirming checkout", async () => {
      render(<HomeView />);
      await userEvent.click(
        within(getBookCard("Design Patterns")).getByRole("button", { name: /check out/i })
      );
      await userEvent.selectOptions(
        screen.getByRole("combobox"),
        screen.getByRole("option", { name: /Alice Johnson/ })
      );
      await userEvent.click(screen.getByRole("button", { name: /confirm checkout/i }));

      // Modal should close
      expect(screen.queryByRole("heading", { name: /check out book/i })).not.toBeInTheDocument();
      // Card should now show Return Book
      expect(within(getBookCard("Design Patterns")).getByRole("button", { name: /return book/i })).toBeInTheDocument();
    });
  });

  describe("return flow", () => {
    it("marks a book as available after returning from BookCard", async () => {
      render(<HomeView />);
      // Dune (b5) is currently checked out
      await userEvent.click(
        within(getBookCard("Dune")).getByRole("button", { name: /return book/i })
      );
      expect(within(getBookCard("Dune")).getByRole("button", { name: /check out/i })).toBeInTheDocument();
    });

    it("removes a checkout from the OverdueList after returning", async () => {
      render(<HomeView />);
      const overdueSection = screen.getByRole("heading", { name: /overdue returns/i }).closest("section")!;
      // Seed has 2 overdue checkouts
      const returnButtons = within(overdueSection).getAllByRole("button", { name: /return/i });
      expect(returnButtons).toHaveLength(2);

      await userEvent.click(returnButtons[0]);

      const remainingButtons = within(overdueSection).queryAllByRole("button", { name: /return/i });
      expect(remainingButtons).toHaveLength(1);
    });
  });
});
