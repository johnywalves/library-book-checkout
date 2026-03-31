"use client";

import { useState } from "react";
import { Book, Checkout } from "@/lib/types";
import { BOOKS, MEMBERS, CHECKOUTS } from "@/lib/seed";
import { isOverdue, toISODate } from "@/lib/utils";
import BookCard from "@/components/BookCard";
import CheckoutModal from "@/components/CheckoutModal";
import OverdueList from "@/components/OverdueList";
import { tabButton } from "./styles";

type Tab = "all" | "available" | "checkedOut";

export default function HomeView() {
  const [checkouts, setCheckouts] = useState<Checkout[]>(CHECKOUTS);
  const [checkoutTarget, setCheckoutTarget] = useState<Book | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const overdueCount = checkouts.filter(isOverdue).length;

  const filteredBooks = BOOKS.filter((book) => {
    const active = checkouts.find((c) => c.bookId === book.id && !c.returnedDate);
    if (activeTab === "available") return !active;
    if (activeTab === "checkedOut") return !!active;
    return true;
  });

  function handleCheckout(memberId: string, checkedOutDate: string, dueDate: string) {
    if (!checkoutTarget) return;
    const newCheckout: Checkout = {
      id: `c${Date.now()}`,
      bookId: checkoutTarget.id,
      memberId,
      checkedOutDate,
      dueDate,
    };
    setCheckouts((prev) => [...prev, newCheckout]);
    setCheckoutTarget(null);
  }

  function handleReturn(checkout: Checkout) {
    setCheckouts((prev) =>
      prev.map((c) =>
        c.id === checkout.id ? { ...c, returnedDate: toISODate(new Date()) } : c
      )
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
          <h1 className="text-xl font-bold text-gray-900">Library Checkout</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{MEMBERS.length} members</span>
          <span>·</span>
          <span>{BOOKS.length} books</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-semibold text-gray-900">Overdue Returns</h2>
            {overdueCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                {overdueCount}
              </span>
            )}
          </div>
          <OverdueList
            checkouts={checkouts}
            books={BOOKS}
            members={MEMBERS}
            onReturn={handleReturn}
          />
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Book Collection</h2>
            <TabBar active={activeTab} onChange={setActiveTab} checkouts={checkouts} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                checkouts={checkouts}
                members={MEMBERS}
                onCheckout={setCheckoutTarget}
                onReturn={handleReturn}
              />
            ))}
            {filteredBooks.length === 0 && (
              <p className="col-span-full text-center text-sm text-gray-500 py-8">
                No books in this category.
              </p>
            )}
          </div>
        </section>
      </div>

      {checkoutTarget && (
        <CheckoutModal
          book={checkoutTarget}
          members={MEMBERS}
          onConfirm={handleCheckout}
          onClose={() => setCheckoutTarget(null)}
        />
      )}
    </main>
  );
}

function TabBar({
  active,
  onChange,
  checkouts,
}: Readonly<{
  active: Tab;
  onChange: (t: Tab) => void;
  checkouts: Checkout[];
}>) {
  const availableCount = BOOKS.filter(
    (b) => !checkouts.some((c) => c.bookId === b.id && !c.returnedDate)
  ).length;
  const checkedOutCount = BOOKS.length - availableCount;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "all", label: "All", count: BOOKS.length },
    { key: "available", label: "Available", count: availableCount },
    { key: "checkedOut", label: "Checked Out", count: checkedOutCount },
  ];

  return (
    <div className="flex gap-1 bg-gray-200 rounded-lg p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={tabButton({ active: active === tab.key })}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1 text-gray-400">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
