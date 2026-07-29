"use client";

import { useState, useTransition } from "react";
import { escolherHorarioSolicitacao, remarcarSolicitacao } from "@/actions/agendamento";

type Solicitacao = {
  id: string;
  status: string;
  mensagem: string | null;
  opcao1: Date | null;
  opcao2: Date | null;
  opcao3: Date | null;
  escolhaData: Date | null;
  professor?: { nome: string; materia?: string | null } | null;
  respondidoPor?: { nome: string; materia?: string | null } | null;
};

function formatarData(d: Date) {
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function MinhasSolicitacoesList({
  solicitacoes,
  link,
  permitirRemarcar = false,
}: {
  solicitacoes: Solicitacao[];
  link: string | null;
  permitirRemarcar?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [erros, setErros] = useState<Record<string, string>>({});
  const [remarcando, setRemarcando] = useState<string | null>(null);

  if (solicitacoes.length === 0) {
    return <p className="text-sm text-ink-faint">Nenhuma solicitação ainda.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {solicitacoes.map((s) => {
        const pessoa = s.professor ?? s.respondidoPor;
        const funcao = s.professor ? s.professor.materia || "Professor(a)" : "Apoio psicossocial";
        return (
        <div key={s.id} className="bg-surface border border-border rounded-2xl p-4">
          {pessoa && (
            <div className="mb-1">
              <div className="font-bold text-sm">{pessoa.nome}</div>
              <div className="text-[11px] text-ink-faint font-semibold">{funcao}</div>
            </div>
          )}
          {s.mensagem && <p className="text-xs text-ink-faint mb-2">{s.mensagem}</p>}

          {s.status === "PENDENTE" && (
            <span className="text-[11px] font-bold uppercase text-terracotta bg-terracotta/10 px-2.5 py-1 rounded-full">
              Aguardando resposta
            </span>
          )}

          {s.status === "AGUARDANDO_ESCOLHA" && (
            <div>
              <p className="text-xs font-bold text-ink-soft mb-2">Escolha um horário:</p>
              <div className="flex flex-col gap-1.5">
                {[s.opcao1, s.opcao2, s.opcao3].map(
                  (op, i) =>
                    op && (
                      <button
                        key={i}
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            const erro = await escolherHorarioSolicitacao(s.id, (i + 1) as 1 | 2 | 3);
                            setErros((prev) => ({ ...prev, [s.id]: erro ?? "" }));
                          })
                        }
                        className="text-left text-sm px-3.5 py-2 rounded-xl border border-border-strong hover:border-ink disabled:opacity-60"
                      >
                        {formatarData(op)}
                      </button>
                    )
                )}
              </div>
              {erros[s.id] && (
                <p className="text-xs font-semibold text-terracotta mt-2">{erros[s.id]}</p>
              )}
            </div>
          )}

          {s.status === "CONFIRMADO" && s.escolhaData && (
            <div>
              <span className="text-[11px] font-bold uppercase text-teal bg-teal/10 px-2.5 py-1 rounded-full">
                Confirmado — {formatarData(s.escolhaData)}
              </span>
              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-xs font-bold text-teal"
                >
                  Link da videochamada →
                </a>
              )}
              {permitirRemarcar && (
                <div className="mt-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      if (!confirm("Pedir para remarcar esse horário?")) return;
                      startTransition(async () => {
                        const erro = await remarcarSolicitacao(s.id);
                        if (erro) {
                          setErros((prev) => ({ ...prev, [s.id]: erro }));
                        } else {
                          setRemarcando(s.id);
                        }
                      });
                    }}
                    className="text-xs font-bold text-terracotta disabled:opacity-60"
                  >
                    {remarcando === s.id ? "Pedido enviado ✓" : "Pedir para remarcar"}
                  </button>
                  {erros[s.id] && (
                    <p className="text-xs font-semibold text-terracotta mt-1">{erros[s.id]}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
}
