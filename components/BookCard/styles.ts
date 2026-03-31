import { tv } from "tailwind-variants";

export type Status = "available" | "checkedOut" | "overdue";

export const STATUS_LABEL: Record<Status, string> = {
  available: "Available",
  checkedOut: "Checked Out",
  overdue: "Overdue",
};

export function getStatus(checkedOut: boolean, overdue: boolean): Status {
  if (overdue) return "overdue";
  if (checkedOut) return "checkedOut";
  return "available";
}

export const card = tv({
  base: "rounded-xl border p-5 flex flex-col gap-3 shadow-sm transition-colors",
  variants: {
    status: {
      available: "border-green-300 bg-green-50",
      checkedOut: "border-yellow-300 bg-yellow-50",
      overdue: "border-red-300 bg-red-50",
    },
  },
});

export const badge = tv({
  base: "shrink-0 text-xs font-semibold px-2 py-1 rounded-full border",
  variants: {
    status: {
      available: "bg-green-100 text-green-700 border-green-200",
      checkedOut: "bg-yellow-100 text-yellow-700 border-yellow-200",
      overdue: "bg-red-100 text-red-700 border-red-200",
    },
  },
});

export const actionButton = tv({
  base: "w-full rounded-lg text-sm font-medium py-2 transition-colors",
  variants: {
    variant: {
      checkout: "bg-indigo-600 text-white hover:bg-indigo-700",
      return: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100",
    },
  },
});
