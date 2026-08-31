"use client";

import { useState } from "react";
import { ApagarQuestaoButton } from "@/components/gestao/ApagarQuestaoButton";
import { EditarQuestaoForm } from "@/components/gestao/EditarQuestaoForm";

type Questao = {
  id: string;
  prova: string;
  materia: string;
  ano: number | null;
  enunciado: string;
  imagemUrl: string | null;
  opcaoA: string;
  opcaoB: string;
  opcaoC: string;
  opcaoD: string;
  opcaoE: string | null;
  respostaCorreta: string;
  subtema: string | null;
};

export function QuestaoDaListaComEdicao({
  questao,
  disciplinas,
}: {
  questao: Questao;
  disciplinas: { id: string; nome: string }[];
}) {
  const [editando, setEditando] = useState(false);

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-4">
        <button type="button" onClick={() => setEditando((v) => !v)} className="min-w-0 text-left flex-1">
          <div className="font-mono text-[11px] font-bold text-terracotta uppercase tracking-wide mb-1">
            {questao.prova} · {questao.materia} {questao.ano ? `· ${questao.ano}` : ""}{" "}
            {questao.subtema ? `· ${questao.subtema}` : ""}
          </div>
          <div className="text-sm line-clamp-2">{questao.enunciado}</div>
          <div className="text-xs text-ink-faint mt-1 flex items-center gap-2">
            <span>Resposta: {questao.respostaCorreta}</span>
            {questao.imagemUrl && <span className="text-teal font-semibold">📷 tem imagem</span>}
          </div>
        </button>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setEditando((v) => !v)}
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-paper"
          >
            {editando ? "Fechar" : "Editar"}
          </button>
          <ApagarQuestaoButton questaoId={questao.id} />
        </div>
      </div>

      {editando && (
        <EditarQuestaoForm
          questao={questao}
          disciplinas={disciplinas}
          aoSalvar={() => setEditando(false)}
        />
      )}
    </div>
  );
}
