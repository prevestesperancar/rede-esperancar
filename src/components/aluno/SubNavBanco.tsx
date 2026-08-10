"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/aluno/questoes", label: "Início" },
  { href: "/aluno/questoes/praticar", label: "Praticar" },
  { href: "/aluno/questoes/revisao", label: "Revisão" },
  { href: "/aluno/questoes/desempenho", label: "Desempenho" },
];

export function SubNavBanco() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {ITEMS.map((item) => {
        const ativo = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`text-sm font-bold px-4 py-2 rounded-full border ${
              ativo ? "bg-ink border-ink text-paper" : "border-border-strong text-ink-soft"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
