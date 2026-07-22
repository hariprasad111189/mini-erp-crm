import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "green" | "amber" | "red" | "blue";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-800",
  red: "bg-red-50 text-red-700",
  blue: "bg-sky-50 text-sky-700"
};

export const Badge = ({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) => (
  <span
    className={cn("inline-flex h-6 items-center rounded-md px-2 text-xs font-semibold", tones[tone], className)}
    {...props}
  />
);

