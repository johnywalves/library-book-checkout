"use client";

import { isOverdue, formatDate } from "@/lib/utils";
import { OverdueListProps } from "./types";

export default function OverdueList({ checkouts, books, members, onReturn }: Readonly<OverdueListProps>) {
  const overdueCheckouts = checkouts.filter(isOverdue);

  if (overdueCheckouts.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-center text-sm text-gray-500">
        No overdue checkouts.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {overdueCheckouts.map((checkout) => {
        const book = books.find((b) => b.id === checkout.bookId);
        const member = members.find((m) => m.id === checkout.memberId);
        if (!book || !member) return null;

        const daysOverdue = Math.floor(
          (Date.now() - new Date(checkout.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        return (
          <div
            key={checkout.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">{book.title}</p>
              <p className="text-sm text-gray-600">{member.name}</p>
              <p className="text-xs text-red-600 font-medium mt-0.5">
                Due {formatDate(checkout.dueDate)} · {daysOverdue} day{daysOverdue === 1 ? "" : "s"} overdue
              </p>
            </div>
            <button
              onClick={() => onReturn(checkout)}
              className="shrink-0 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-medium px-3 py-1.5 hover:bg-gray-100 transition-colors"
            >
              Return
            </button>
          </div>
        );
      })}
    </div>
  );
}
