import { tv } from "tailwind-variants";

export const tabButton = tv({
  base: "text-xs font-medium px-3 py-1.5 rounded-md transition-colors",
  variants: {
    active: {
      true: "bg-white text-gray-900 shadow-sm",
      false: "text-gray-500 hover:text-gray-700",
    },
  },
});
