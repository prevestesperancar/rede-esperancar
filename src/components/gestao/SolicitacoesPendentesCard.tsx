import { ResponderSolicitacaoForm } from "@/components/gestao/ResponderSolicitacaoForm";

type Solicitacao = {
  id: string;
  mensagem: string | null;
  createdAt: Date;
  estudante: { user: { nome: string } };
};

export function SolicitacoesPendentesCard({
  titulo,
  solicitacoes,
}: {
  titulo: string;
  solicitacoes: Solicitacao[];
}) {
  if (solicitacoes.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-[18px] p-5 mb-4">
      <h3 className="font-extrabold text-[15px] mb-3">{titulo}</h3>
      <div className="flex flex-col gap-3">
        {solicitacoes.map((s) => (
          <div key={s.id} className="bg-paper rounded-2xl p-3.5">
            <div className="font-bold text-sm">{s.estudante.user.nome}</div>
            {s.mensagem && <p className="text-xs text-ink-soft mt-0.5">{s.mensagem}</p>}
            <div className="text-[11px] text-ink-faint font-mono mt-1">
              Pedido em {s.createdAt.toLocaleDateString("pt-BR")}
            </div>
            <ResponderSolicitacaoForm solicitacaoId={s.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
