"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/common/NotificationBell";

const ITEMS_COORDENACAO = [
  { href: "/gestao", label: "Dashboard", icon: "🏠" },
  { href: "/gestao/estudantes", label: "Estudantes", icon: "🧑‍🎓" },
  { href: "/gestao/turmas", label: "Turmas", icon: "🏫" },
  { href: "/gestao/professores", label: "Professores", icon: "🧑‍🏫" },
  { href: "/gestao/materiais", label: "Materiais", icon: "📚" },
  { href: "/gestao/historias", label: "Histórias", icon: "💬" },
  { href: "/gestao/monitorias", label: "Monitorias", icon: "🧩" },
  { href: "/gestao/redacoes", label: "Redação", icon: "✍️" },
  { href: "/gestao/eventos", label: "Eventos", icon: "📅" },
  { href: "/gestao/avisos", label: "Avisos", icon: "📢" },
  { href: "/gestao/simulados", label: "Simulados", icon: "📝" },
  { href: "/gestao/questoes", label: "Banco de questões", icon: "❓" },
  { href: "/gestao/frequencia", label: "Frequência detalhada", icon: "📊" },
  { href: "/gestao/formularios", label: "Formulários", icon: "🗂️" },
  { href: "/gestao/inscricoes", label: "Inscrições", icon: "📋" },
  { href: "/gestao/usuarios", label: "Usuários", icon: "🔑" },
];

const ITEMS_PROFESSOR = [
  { href: "/gestao", label: "Dashboard", icon: "🏠" },
  { href: "/gestao/estudantes", label: "Estudantes", icon: "🧑‍🎓" },
  { href: "/gestao/materiais", label: "Materiais", icon: "📚" },
  { href: "/gestao/monitorias", label: "Monitorias", icon: "🧩" },
  { href: "/gestao/redacoes", label: "Redação", icon: "✍️" },
  { href: "/gestao/eventos", label: "Eventos", icon: "📅" },
  { href: "/gestao/avisos", label: "Avisos", icon: "📢" },
  { href: "/gestao/simulados", label: "Simulados", icon: "📝" },
  { href: "/gestao/questoes", label: "Banco de questões", icon: "❓" },
];

const ITEMS_APOIO = [
  { href: "/gestao", label: "Dashboard", icon: "🏠" },
  { href: "/gestao/estudantes", label: "Estudantes", icon: "🧑‍🎓" },
  { href: "/gestao/frequencia", label: "Frequência detalhada", icon: "📊" },
  { href: "/gestao/simulados", label: "Desempenho em simulados", icon: "📝" },
];

const ITEMS_ADMIN = [{ href: "/admin/usuarios", label: "Usuários", icon: "🔑" }];

const ROLE_LABEL: Record<string, string> = {
  COORDENACAO: "Coordenação",
  PROFESSOR: "Professor(a)",
  APOIO_PSICOSSOCIAL: "Apoio psicossocial",
  ADMIN: "Admin",
};

export function Sidebar({
  userName,
  nucleoNome,
  pendentesCount,
  role,
  fotoUrl,
  notificacoes = [],
  naoLidas = 0,
}: {
  userName: string;
  nucleoNome: string;
  pendentesCount: number;
  role: string;
  fotoUrl?: string | null;
  notificacoes?: {
    id: string;
    tipo: string;
    mensagem: string;
    link: string | null;
    lida: boolean;
    createdAt: Date;
  }[];
  naoLidas?: number;
}) {
  const pathname = usePathname();

  const items =
    role === "PROFESSOR"
      ? ITEMS_PROFESSOR
      : role === "APOIO_PSICOSSOCIAL"
      ? ITEMS_APOIO
      : role === "ADMIN"
      ? ITEMS_ADMIN
      : ITEMS_COORDENACAO;

  return (
    <aside className="w-[230px] flex-shrink-0 bg-ink text-paper p-[18px] flex flex-col sticky top-0 h-screen">
      <div className="flex items-center justify-between gap-2.5 mb-7">
        <div className="flex items-center gap-2.5">
          <Image
            src="/images/logo-icon.png"
            alt="Rede Esperançar"
            width={28}
            height={28}
            className="w-7 h-7"
          />
          <span className="font-display text-sm">Esperançar</span>
        </div>
        <NotificationBell notificacoes={notificacoes} naoLidas={naoLidas} dark />
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {items.map((item) => {
          const active =
            item.href === "/gestao"
              ? pathname === "/gestao"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-[10px] text-sm font-semibold transition-colors ${
                active
                  ? "bg-yellow text-yellow-ink font-extrabold"
                  : "text-paper/65 hover:bg-white/5 hover:text-paper"
              }`}
            >
              <span>
                {item.icon} {item.label}
              </span>
              {item.href === "/gestao/inscricoes" && pendentesCount > 0 && (
                <span
                  className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    active ? "bg-yellow-ink text-yellow" : "bg-star text-white"
                  }`}
                >
                  {pendentesCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/gestao/perfil"
        className={`flex items-center gap-2.5 pt-4 border-t border-white/10 rounded-[10px] -mx-1 px-1 ${
          pathname === "/gestao/perfil" ? "text-yellow" : "hover:opacity-80"
        }`}
      >
        <div className="w-9 h-9 rounded-full bg-yellow text-yellow-ink flex items-center justify-center font-display text-xs flex-shrink-0 overflow-hidden">
          {fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fotoUrl} alt={userName} className="w-full h-full object-cover" />
          ) : (
            userName
              .split(" ")
              .slice(0, 2)
              .map((p) => p[0])
              .join("")
              .toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-bold truncate">{userName}</div>
          <div className="text-[11px] text-paper/55 font-mono truncate">
            {ROLE_LABEL[role] ?? role} · {nucleoNome}
          </div>
        </div>
      </Link>
    </aside>
  );
}
