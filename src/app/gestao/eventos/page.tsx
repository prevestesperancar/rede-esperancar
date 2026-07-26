import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEventosDoNucleo, getNucleoNome } from "@/lib/queries/gestao";
import { apagarEvento } from "@/actions/gestao";
import { NovoEventoForm } from "@/components/gestao/NovoEventoForm";
import { ApagarItemButton } from "@/components/gestao/ApagarItemButton";

export default async function GestaoEventosPage() {
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");

  const [eventos, nucleoNome] = await Promise.all([
    getEventosDoNucleo(session.user.nucleoId),
    getNucleoNome(session.user.nucleoId),
  ]);

  return (
    <div>
      <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div>
          <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide mb-1.5">
            {nucleoNome}
          </div>
          <h1 className="font-display text-2xl">Eventos</h1>
        </div>
      </div>

      <NovoEventoForm />

      <div className="bg-surface border border-border rounded-[18px] overflow-hidden">
        {eventos.map((e) => (
          <div
            key={e.id}
            className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-b-0"
          >
            <div className="font-mono font-bold text-xs text-terracotta w-[110px] flex-shrink-0">
              {e.data.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm">{e.titulo}</div>
              <div className="text-xs text-ink-faint">{e.local}</div>
            </div>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                e.publico ? "bg-teal/10 text-teal" : "bg-ink-faint/10 text-ink-faint"
              }`}
            >
              {e.publico ? "Público" : "Interno"}
            </span>
            <ApagarItemButton
              id={e.id}
              action={apagarEvento}
              confirmMessage="Apagar este evento?"
            />
          </div>
        ))}
        {eventos.length === 0 && (
          <p className="text-sm text-ink-faint p-5">Nenhum evento ainda.</p>
        )}
      </div>
    </div>
  );
}
