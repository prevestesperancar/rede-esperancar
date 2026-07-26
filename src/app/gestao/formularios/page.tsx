import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getFormulariosDoNucleo } from "@/lib/queries/formularios";
import { getNucleoNome } from "@/lib/queries/gestao";
import { NovoFormularioForm } from "@/components/gestao/NovoFormularioForm";
import { ToggleFormularioAtivoButton } from "@/components/gestao/ToggleFormularioAtivoButton";
import { ApagarItemButton } from "@/components/gestao/ApagarItemButton";
import { apagarFormulario } from "@/actions/formularios";

const PERMITIDOS = ["COORDENACAO", "ADMIN"];

export default async function FormulariosPage() {
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");
  if (!PERMITIDOS.includes(session.user.role)) redirect("/gestao");

  const [formularios, nucleoNome] = await Promise.all([
    getFormulariosDoNucleo(session.user.nucleoId),
    getNucleoNome(session.user.nucleoId),
  ]);

  return (
    <div>
      <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide mb-1.5">
        {nucleoNome}
      </div>
      <h1 className="font-display text-2xl mb-1">Formulários</h1>
      <p className="text-sm text-ink-soft mb-6">
        Crie formulários próprios, envie o link pra quem precisar responder e acompanhe as
        respostas aqui como uma planilha (exportável em CSV).
      </p>

      <NovoFormularioForm />

      <div className="flex flex-col gap-3">
        {formularios.map((f) => (
          <div key={f.id} className="bg-surface border border-border rounded-[18px] p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-bold text-sm">{f.titulo}</div>
                <div className="text-xs text-ink-faint">{f._count.respostas} resposta(s)</div>
              </div>
              <div className="flex items-center gap-2">
                <ToggleFormularioAtivoButton formularioId={f.id} ativo={f.ativo} />
                <Link href={`/gestao/formularios/${f.id}`} className="text-xs font-bold text-terracotta">
                  Ver respostas →
                </Link>
                <ApagarItemButton
                  id={f.id}
                  action={apagarFormulario}
                  confirmMessage="Apagar este formulário e todas as respostas?"
                />
              </div>
            </div>
          </div>
        ))}
        {formularios.length === 0 && (
          <p className="text-sm text-ink-faint">Nenhum formulário criado ainda.</p>
        )}
      </div>
    </div>
  );
}
