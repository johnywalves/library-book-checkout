"use client";

import { getActiveCheckout, formatDate, isOverdue } from "@/lib/utils";
import { BookCardProps } from "./types";
import { card, badge, actionButton, getStatus, STATUS_LABEL } from "./styles";

export default function BookCard({ book, checkouts, members, onCheckout, onReturn }: Readonly<BookCardProps>) {
  const activeCheckout = getActiveCheckout(book.id, checkouts);
  const overdue = !!activeCheckout && isOverdue(activeCheckout);
  const status = getStatus(!!activeCheckout, overdue);
  const borrower = activeCheckout && members.find((m) => m.id === activeCheckout.memberId);

  return (
    <div className={card({ status })}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900 leading-tight">{book.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{book.author}</p>
          <p className="text-xs text-gray-400 mt-0.5">ISBN: {book.isbn}</p>
        </div>
        <span className={badge({ status })}>{STATUS_LABEL[status]}</span>
      </div>

      {activeCheckout && borrower && (
        <div className="text-sm text-gray-700 bg-white/60 rounded-lg px-3 py-2 space-y-0.5">
          <p><span className="font-medium">Borrower:</span> {borrower.name}</p>
          <p><span className="font-medium">Due:</span> {formatDate(activeCheckout.dueDate)}</p>
          {overdue && (
            <p className="text-red-600 font-medium">
              Overdue since {formatDate(activeCheckout.dueDate)}
            </p>
          )}
        </div>
      )}

      <div className="mt-auto">
        {activeCheckout ? (
          <button
            onClick={() => onReturn(activeCheckout)}
            className={actionButton({ variant: "return" })}
          >
            Return Book
          </button>
        ) : (
          <button
            onClick={() => onCheckout(book)}
            className={actionButton({ variant: "checkout" })}
          >
            Check Out
          </button>
        )}
      </div>
    </div>
  );
}
