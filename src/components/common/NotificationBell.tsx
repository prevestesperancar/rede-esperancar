"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { marcarNotificacaoLida, marcarTodasNotificacoesLidas } from "@/actions/notificacoes";

type Notificacao = {
  id: string;
  tipo: string;
  mensagem: string;
  link: string | null;
  lida: boolean;
  createdAt: Date;
};

export function NotificationBell({
  notificacoes,
  naoLidas,
  dark = false,
}: {
  notificacoes: Notificacao[];
  naoLidas: number;
  dark?: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const router = useRouter();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className={`relative w-9 h-9 rounded-full flex items-center justify-center text-base ${
          dark ? "bg-white/10 text-paper" : "bg-surface border border-border"
        }`}
      >
        🔔
        {naoLidas > 0 && (
          <span className="absolute -top-1 -right-1 bg-terracotta text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setAberto(false)} />
          <div
            className={`absolute mt-2 w-[min(20rem,90vw)] max-h-96 overflow-y-auto bg-surface border border-border rounded-2xl shadow-lg z-20 p-2 ${
              dark ? "left-0" : "right-0"
            }`}
          >
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="font-extrabold text-sm text-ink">Notificações</span>
              {naoLidas > 0 && (
                <button
                  type="button"
                  onClick={() => marcarTodasNotificacoesLidas()}
                  className="text-xs font-bold text-terracotta"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
            {notificacoes.length === 0 && (
              <p className="text-sm text-ink-faint px-2 py-3">Nenhuma notificação ainda.</p>
            )}
            {notificacoes.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  setAberto(false);
                  if (!n.lida) marcarNotificacaoLida(n.id);
                  if (n.link) router.push(n.link);
                }}
                className={`w-full text-left px-2.5 py-2.5 rounded-xl mb-0.5 ${
                  n.lida ? "text-ink-soft" : "bg-yellow/10 text-ink font-semibold"
                }`}
              >
                <div className="text-sm">{n.mensagem}</div>
                <div className="text-[11px] text-ink-faint font-mono mt-0.5">
                  {n.createdAt.toLocaleDateString("pt-BR")}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
