"use client";

import { useState } from "react";
import { addDays, toISODate, formatDate } from "@/lib/utils";
import { CheckoutModalProps } from "./types";

export default function CheckoutModal({ book, members, onConfirm, onClose }: Readonly<CheckoutModalProps>) {
  const [selectedMemberId, setSelectedMemberId] = useState("");

  const today = new Date();
  const dueDate = addDays(today, 14);
  const todayStr = toISODate(today);
  const dueDateStr = toISODate(dueDate);

  function handleConfirm() {
    if (!selectedMemberId) return;
    onConfirm(selectedMemberId, todayStr, dueDateStr);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Check Out Book</h2>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-medium text-gray-700">{book.title}</span> by {book.author}
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="member-select" className="text-sm font-medium text-gray-700">
            Member
          </label>
          <select
            id="member-select"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select a member…</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.email}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3">
          <div>
            <span className="font-medium">Checked out:</span> {formatDate(todayStr)}
          </div>
          <div>
            <span className="font-medium">Due:</span> {formatDate(dueDateStr)}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium py-2 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedMemberId}
            className="flex-1 rounded-lg bg-indigo-600 text-white text-sm font-medium py-2 hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
