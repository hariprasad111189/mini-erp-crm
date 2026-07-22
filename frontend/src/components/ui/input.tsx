import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      "h-10 w-full rounded-md border bg-white px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring",
      className
    )}
    {...props}
  />
);

export const Select = ({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className={cn(
      "h-10 w-full rounded-md border bg-white px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring",
      className
    )}
    {...props}
  />
);

