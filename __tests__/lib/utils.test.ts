import { addDays, toISODate, isOverdue, isCheckedOut, getActiveCheckout, formatDate } from "@/lib/utils";
import { Checkout } from "@/lib/types";

describe("addDays", () => {
  it("adds days to a date", () => {
    const date = new Date("2026-01-01T12:00:00");
    const result = addDays(date, 14);
    expect(result.getDate()).toBe(15);
    expect(result.getMonth()).toBe(0); // January
  });

  it("does not mutate the original date", () => {
    const date = new Date("2026-01-01T12:00:00");
    addDays(date, 14);
    expect(date.getDate()).toBe(1);
  });

  it("handles month rollovers", () => {
    const date = new Date("2026-01-28T12:00:00");
    const result = addDays(date, 5);
    expect(result.getMonth()).toBe(1); // February
  });
});

describe("toISODate", () => {
  it("returns YYYY-MM-DD format", () => {
    const date = new Date("2026-03-15T12:00:00Z");
    expect(toISODate(date)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns the correct date", () => {
    const date = new Date("2026-03-31T00:00:00");
    expect(toISODate(date)).toBe("2026-03-31");
  });
});

describe("isOverdue", () => {
  const FIXED_NOW = new Date("2026-03-31T12:00:00").getTime();

  beforeEach(() => {
    jest.spyOn(Date, "now").mockReturnValue(FIXED_NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns true for a past due date with no returnedDate", () => {
    const checkout: Checkout = {
      id: "c1",
      bookId: "b1",
      memberId: "m1",
      checkedOutDate: "2026-03-01",
      dueDate: "2026-03-15",
    };
    expect(isOverdue(checkout)).toBe(true);
  });

  it("returns false when the book has been returned", () => {
    const checkout: Checkout = {
      id: "c1",
      bookId: "b1",
      memberId: "m1",
      checkedOutDate: "2026-03-01",
      dueDate: "2026-03-15",
      returnedDate: "2026-03-14",
    };
    expect(isOverdue(checkout)).toBe(false);
  });

  it("returns false for a future due date", () => {
    const checkout: Checkout = {
      id: "c1",
      bookId: "b1",
      memberId: "m1",
      checkedOutDate: "2026-03-25",
      dueDate: "2026-04-08",
    };
    expect(isOverdue(checkout)).toBe(false);
  });
});

describe("isCheckedOut", () => {
  const checkouts: Checkout[] = [
    {
      id: "c1",
      bookId: "b1",
      memberId: "m1",
      checkedOutDate: "2026-03-01",
      dueDate: "2026-03-15",
    },
    {
      id: "c2",
      bookId: "b2",
      memberId: "m2",
      checkedOutDate: "2026-03-01",
      dueDate: "2026-03-15",
      returnedDate: "2026-03-10",
    },
  ];

  it("returns true when book is actively checked out", () => {
    expect(isCheckedOut("b1", checkouts)).toBe(true);
  });

  it("returns false when book has been returned", () => {
    expect(isCheckedOut("b2", checkouts)).toBe(false);
  });

  it("returns false when book has no checkouts", () => {
    expect(isCheckedOut("b3", checkouts)).toBe(false);
  });
});

describe("getActiveCheckout", () => {
  const checkouts: Checkout[] = [
    {
      id: "c1",
      bookId: "b1",
      memberId: "m1",
      checkedOutDate: "2026-03-01",
      dueDate: "2026-03-15",
    },
    {
      id: "c2",
      bookId: "b2",
      memberId: "m2",
      checkedOutDate: "2026-03-01",
      dueDate: "2026-03-15",
      returnedDate: "2026-03-10",
    },
  ];

  it("returns the active checkout for a checked-out book", () => {
    expect(getActiveCheckout("b1", checkouts)).toEqual(checkouts[0]);
  });

  it("returns undefined for a returned book", () => {
    expect(getActiveCheckout("b2", checkouts)).toBeUndefined();
  });

  it("returns undefined for a book with no checkouts", () => {
    expect(getActiveCheckout("b3", checkouts)).toBeUndefined();
  });
});

describe("formatDate", () => {
  it("returns a human-readable date string", () => {
    expect(formatDate("2026-03-31")).toMatch(/Mar\s+31,\s+2026/);
  });

  it("formats January correctly", () => {
    expect(formatDate("2026-01-01")).toMatch(/Jan\s+1,\s+2026/);
  });
});
