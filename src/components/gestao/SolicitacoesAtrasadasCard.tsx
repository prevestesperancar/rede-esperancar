type Solicitacao = {
  id: string;
  tipo: string;
  createdAt: Date;
  estudante: { user: { nome: string } };
  professor: { nome: string } | null;
};

export function SolicitacoesAtrasadasCard({ solicitacoes }: { solicitacoes: Solicitacao[] }) {
  if (solicitacoes.length === 0) return null;

  return (
    <div className="bg-terracotta/5 border border-terracotta/30 rounded-[18px] p-5 mb-4">
      <h3 className="font-extrabold text-[15px] text-terracotta mb-1">
        ⚠️ Solicitações sem resposta há mais de 3 dias
      </h3>
      <div className="flex flex-col gap-2 mt-3">
        {solicitacoes.map((s) => (
          <div key={s.id} className="flex items-center justify-between bg-surface rounded-xl px-3.5 py-2.5">
            <div>
              <div className="font-bold text-sm">{s.estudante.user.nome}</div>
              <div className="text-xs text-ink-faint">
                {s.tipo === "MONITORIA" ? `Monitoria com ${s.professor?.nome ?? "professor"}` : "Apoio psicossocial"}
              </div>
            </div>
            <span className="text-xs font-mono text-terracotta">
              desde {s.createdAt.toLocaleDateString("pt-BR")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
