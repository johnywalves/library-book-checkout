# Technical Decisions — Library Book Checkout UI

## Overview

This document maps every significant technical choice made in this project to the requirements from the Library Book Checkout UI brief. The goal is to explain not just *what* was chosen, but *why* — and how it serves the stated goals.

---

## Stack Summary

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.1 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS v4 + tailwind-variants | ^4 / ^3.2.2 |
| State | React `useState` (local) | — |
| Persistence | None (in-memory only) | — |

---

## 1. Framework: Next.js 16 with App Router

**Choice**: Next.js was used instead of a simpler Vite + React setup.

**Why it fits the brief**:
The brief explicitly names Next.js as an acceptable scaffolding option. Next.js provides a production-grade project structure out of the box — routing, font optimization, TypeScript config, and ESLint — without requiring manual wiring. For a 2-hour time budget, starting from a solid scaffold (rather than Vite + manual router) preserves time for feature work.

**App Router (not Pages Router)**:
Next.js 16 defaults to the App Router, which uses React Server Components. The application selectively opts components into the client via `"use client"` only where interactivity is needed. Static boundaries (`app/layout.tsx`, `app/page.tsx`) stay as server components, keeping the rendering boundary clean.

**Tradeoff acknowledged**: Next.js adds overhead that a pure Vite SPA would not. For a project with no backend, server-side rendering provides limited benefit. The choice was made for scaffolding speed and familiarity, not for SSR value.

---

## 2. Language: TypeScript (Strict Mode)

**Choice**: Full TypeScript with `strict: true` in `tsconfig.json`.

**Why it fits the brief**:
The brief states "TypeScript is encouraged." Beyond compliance, strict TypeScript directly reduces bugs in the domain logic — the checkout/return state transitions and date comparisons are exactly the kind of place where a missed `null` or wrong type would cause a silent runtime error that only shows up in a demo. Strict mode forces those issues to compile time.

**How it shapes the code**:
- `Checkout.returnedDate` is typed as `string | undefined`. Functions like `isOverdue` and `getActiveCheckout` are guaranteed to handle both states because TypeScript enforces it.
- Component props are defined in separate `*.types.ts` files, making the contract for each component explicit and navigable.
- Event handler types (`() => void`, `(memberId: string) => void`) prevent wiring mismatches between parent and child components.

---

## 3. State Management: React `useState` Only

**Choice**: No Redux, Zustand, Context API, or any external state library. All state lives in `HomeView.tsx`.

**Why it fits the brief**:
The brief says "all data should be managed in local state." A single `checkouts: Checkout[]` array in `HomeView` is the source of truth. Derived facts — which books are available, which are overdue — are computed inline via filter/find at render time rather than stored separately.

This is the simplest design that satisfies the requirements:
- Checking out a book appends a new `Checkout` record.
- Returning a book updates the matching record's `returnedDate` via `map()`.
- Overdue items are those where `dueDate < today` and `returnedDate` is absent.

**Why not Context or Zustand**:
With three components that need checkout data and a single view orchestrating them, prop drilling is flat (one level deep from `HomeView` to children). Adding a context or store would introduce indirection without reducing complexity. The brief also explicitly limits scope — "a simpler solution you fully own is better than a sophisticated one you can't explain."

**Tradeoff**: State resets on page reload. The brief explicitly requires no backend, making this the expected behavior.

---

## 4. Data Model

**Choice**: Three domain types (`Book`, `Member`, `Checkout`) with ISO date strings.

```typescript
interface Checkout {
  id: string;
  bookId: string;
  memberId: string;
  checkedOutDate: string;   // "YYYY-MM-DD"
  dueDate: string;          // "YYYY-MM-DD"
  returnedDate?: string;    // absent = still checked out
}
```

**Design decisions explained**:

**Books and Members are immutable reference data.** The checkout record holds IDs that point to them. This mirrors relational database thinking: the checkout is the fact that changes; the book and member are stable entities.

**`returnedDate` as optional** is the simplest possible way to represent "is this book out." No boolean `isReturned` flag that can go out of sync. A missing `returnedDate` *is* the definition of "checked out." This eliminates a class of inconsistent state.

**ISO date strings** (`YYYY-MM-DD`) instead of `Date` objects. JavaScript `Date` objects are mutable and serialize unpredictably. String comparisons (`dueDate < today`) work correctly with ISO format, which makes the `isOverdue` check a simple string compare with no timezone surprises.

**Why it satisfies the brief**:
- View available books: filter books where no `Checkout` exists with matching `bookId` and no `returnedDate`.
- Check out: create a new `Checkout` with `dueDate = today + 14 days`.
- Return: set `returnedDate` on the matching active checkout.
- Overdue: filter active checkouts where `dueDate < today`.
- Seed data includes at least one already-overdue checkout, fulfilling the brief's explicit requirement.

---

## 5. Seed Data

**Choice**: Static seed in `lib/seed.ts`, loaded as `useState` initial values.

**Seed includes**:
- 6 books across technical (Clean Code, Pragmatic Programmer, Design Patterns) and fiction genres (The Hobbit, Dune, 1984).
- 4 members (Alice, Bob, Carol, David) with example email addresses.
- 4 checkouts: 2 overdue, 1 active (not yet due), 1 already returned.

**Why this satisfies the brief**:
The brief requires "at least one checkout that is already overdue." The seed provides two overdue checkouts so the overdue list is non-trivially populated on first load. The returned checkout demonstrates that returned books are no longer shown as checked out. The active checkout demonstrates the yellow "Checked Out" state.

**Why static import and not `useEffect`**:
`useState(CHECKOUTS)` initializes state synchronously at mount. There is no async data fetch, no loading state, no flicker. The seed data is effectively constants — using `useEffect` to set them would add asynchrony for no reason.

---

## 6. Component Architecture

**Choice**: Three layers — `app/` (routing), `views/` (page-level state), `components/` (reusable UI).

```
app/page.tsx          → renders HomeView (no logic)
views/HomeView.tsx    → owns all state, coordinates interactions
components/
  BookCard.tsx        → renders one book, emits checkout/return events
  CheckoutModal.tsx   → member selection form
  OverdueList.tsx     → filtered list of overdue items
lib/
  types.ts            → domain interfaces
  seed.ts             → initial data
  utils.ts            → date helpers, checkout lookup helpers
```

**Why this structure**:
`HomeView` is the single orchestrator. It holds state and passes down only what each child needs. Children are stateless except for ephemeral UI state (selected member in modal). This means:
- Logic is in one place and easy to trace during a review call.
- Components have clear, minimal props interfaces.
- The app can be explained top-down: "HomeView manages state, BookCard displays it, modal collects input."

**Co-located `*.types.ts` and `*.styles.ts`**:
Each component ships with a types file (prop interfaces) and a styles file (tailwind-variants config). This keeps the component file focused on behavior and JSX, while making styles and types independently browsable.

---

## 7. Styling: Tailwind CSS v4 + tailwind-variants

**Choice**: Tailwind for utilities, `tailwind-variants` for component-level variant logic.

**Why Tailwind**:
Tailwind v4 is the latest version and ships with Next.js 16's default scaffold. It provides the entire design system (spacing, color, typography, responsive breakpoints) without writing a single CSS class. For a 2-hour project, this is a meaningful speed advantage.

**Why `tailwind-variants`**:
The status system (available / checked-out / overdue) drives visual differentiation across multiple elements — card border color, background, badge color, button state. Without a variant system, this becomes fragile conditional string concatenation:

```tsx
// fragile: easy to miss a case, no type safety
className={`border ${isOverdue ? 'border-red-300' : isCheckedOut ? 'border-yellow-300' : 'border-green-300'}`}
```

With `tailwind-variants`:
```typescript
// type-safe: TypeScript errors if status is invalid
const card = tv({
  variants: {
    status: {
      available: "border-green-300 bg-green-50",
      checkedOut: "border-yellow-300 bg-yellow-50",
      overdue:    "border-red-300 bg-red-50",
    }
  }
});
// Usage: className={card({ status })}  ← TypeScript validates "status"
```

This ensures visual consistency is enforced by types, not discipline.

**Color system mapping to requirements**:
| State | Color | Semantic meaning |
|---|---|---|
| Available | Green | Safe to check out |
| Checked Out | Yellow | In use, not urgent |
| Overdue | Red | Requires attention |

---

## 8. Checkout Flow

**How it satisfies the brief**:

**"Check out an available book to a member"**
Clicking "Check Out" on an available book opens `CheckoutModal`. The modal lists all members in a dropdown and calculates the due date as today + 14 days. On confirm, a new `Checkout` is appended to state. The book immediately re-renders as "Checked Out" because the derived status is recomputed on every render.

**"Return a book that has been lent out"**
Clicking "Return Book" on a checked-out card calls the return handler, which sets `returnedDate` on the matching active checkout. The book immediately re-renders as "Available."

**"Prevent checkout if already lent out"**
The "Check Out" button is only rendered when `getActiveCheckout(bookId, checkouts)` returns `undefined`. If a book has an active checkout, only "Return Book" is shown. There is no runtime guard needed — the UI makes the invalid state unreachable.

**"See overdue reservations"**
`OverdueList` renders at the top of the page. It filters `checkouts` where `isOverdue()` returns true and shows book title, member name, due date, and days overdue. A quick "Return" button is available inline. If there are no overdue items, the section shows an empty state message.

**"Due back in 14 days"**
`addDays(new Date(), 14)` computes the due date at checkout time. The utility is pure and tested against ISO string output.

---

## 9. Date Utilities (`lib/utils.ts`)

**Choice**: Custom, minimal date utilities instead of a library like `date-fns`.

**Why no `date-fns`**:
The brief's requirements touch dates in exactly three ways: add 14 days, format for display, compare for overdue. These are each a 3-5 line function. Adding a 13KB library to solve three functions would violate the principle of not over-engineering for a scoped task.

**Functions and their purpose**:
| Function | Purpose | Used by |
|---|---|---|
| `addDays(date, n)` | Compute due date | `CheckoutModal` |
| `toISODate(date)` | Serialize `Date` to `"YYYY-MM-DD"` | `CheckoutModal`, `useCheckout` |
| `formatDate(iso)` | Display-friendly format | `BookCard`, `OverdueList` |
| `isOverdue(checkout)` | `dueDate < today && !returnedDate` | `HomeView`, `OverdueList` |
| `getActiveCheckout(bookId, checkouts)` | Find active checkout for a book | `BookCard`, `HomeView` |
| `isCheckedOut(bookId, checkouts)` | Boolean wrapper | `HomeView` filter |

---

## 10. Responsive Design

**Choice**: Mobile-first responsive grid via Tailwind breakpoints.

The book list uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. The modal is a fixed full-screen overlay on mobile that scales to a centered card on larger screens. This isn't a specified requirement, but a librarian might use a tablet at a checkout desk — the layout should not break.

---

## 11. What Was Intentionally Left Out

| Omission | Rationale |
|---|---|
| `localStorage` persistence | The brief says "local state" — interpreted as in-memory. Persistence would complicate the seed data story (stale data on reload). |
| Search / sort | Not mentioned in requirements. Adding it would have consumed time better spent on the core flow. |
| Member management UI | Members are reference data; the brief does not ask for CRUD on members. |
| Animations / transitions | The brief is a functional assessment, not a UI polish exercise. |
| Error boundaries | No async operations, no API calls — nothing to catch. |
| Unit tests | Not mentioned in requirements and not feasible in 2 hours alongside the implementation. |

---

## Summary

Every choice in this project trades toward the same goal: maximum clarity, minimum complexity, full ownership. The stack is modern and justified, the data model is the simplest that satisfies the domain, and the component structure can be walked top-to-bottom in a review call without surprises.
