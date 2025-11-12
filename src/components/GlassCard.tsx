import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

type GlassCardProps = PropsWithChildren<{
  className?: string;
}>;

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div className={twMerge("glass rounded-3xl", className)}>
      {children}
    </div>
  );
}


