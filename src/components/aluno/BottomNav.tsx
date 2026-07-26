"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/aluno", label: "Início", icon: "🏠" },
  { href: "/aluno/turma", label: "Turma", icon: "👥" },
  { href: "/aluno/materiais", label: "Materiais", icon: "📚" },
  { href: "/aluno/monitorias", label: "Monitorias", icon: "🧩" },
  { href: "/aluno/perfil", label: "Perfil", icon: "👤" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border">
      <div className="max-w-md mx-auto flex justify-around px-2 py-3.5 pb-5">
        {ITEMS.map((item) => {
          const active =
            item.href === "/aluno"
              ? pathname === "/aluno"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
                active ? "text-ink" : "text-ink-faint"
              }`}
            >
              <span
                className={`w-[22px] h-[22px] rounded-[7px] flex items-center justify-center text-[13px] ${
                  active ? "bg-yellow" : ""
                }`}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
