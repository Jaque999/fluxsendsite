"use client";

import { type ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type NeonButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};

export function NeonButton({ className, children, ...props }: NeonButtonProps) {
  return (
    <button
      {...props}
      className={twMerge(
        "btn-neon rounded-xl px-5 py-3 inline-flex items-center justify-center gap-2 transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60",
        className
      )}
    >
      {children}
    </button>
  );
}


