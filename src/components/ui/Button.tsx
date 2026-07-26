import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "ghost";

const base =
  "inline-flex items-center gap-2 font-extrabold text-sm px-[22px] py-3 rounded-full border-2 transition-transform hover:-translate-y-0.5";

const variants: Record<Variant, string> = {
  primary: "bg-yellow border-yellow text-yellow-ink",
  ghost: "bg-transparent border-ink text-ink",
};

export function Button({
  href,
  variant = "primary",
  children,
  className = "",
}: {
  href: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
