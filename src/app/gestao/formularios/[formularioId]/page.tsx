import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getFormularioDetalhe } from "@/lib/queries/formularios";
import type { Campo } from "@/actions/formularios";
import { CopiarLinkButton } from "@/components/gestao/CopiarLinkButton";

const PERMITIDOS = ["COORDENACAO", "ADMIN"];

export default async function FormularioDetalhePage({
  params,
}: {
  params: Promise<{ formularioId: string }>;
}) {
  const { formularioId } = await params;
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");
  if (!PERMITIDOS.includes(session.user.role)) redirect("/gestao");

  const formulario = await getFormularioDetalhe(formularioId, session.user.nucleoId);
  if (!formulario) notFound();

  const campos: Campo[] = JSON.parse(formulario.campos);
  const host = (await headers()).get("host");
  const protocolo = host?.startsWith("localhost") ? "http" : "https";
  const linkPublico = `${protocolo}://${host}/formularios/${formulario.id}`;

  return (
    <div>
      <Link href="/gestao/formularios" className="text-sm font-bold text-ink-soft hover:text-ink">
        ← Formulários
      </Link>
      <h1 className="font-display text-2xl mt-3 mb-1">{formulario.titulo}</h1>
      {formulario.descricao && <p className="text-sm text-ink-soft mb-3">{formulario.descricao}</p>}

      <div className="bg-surface border border-border rounded-2xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="font-mono text-[11px] font-bold uppercase text-ink-faint mb-1">
            Link público pra compartilhar
          </div>
          <code className="text-sm text-terracotta break-all">{linkPublico}</code>
        </div>
        <div className="flex gap-2 flex-wrap">
          <CopiarLinkButton link={linkPublico} />
          <a
            href={`/gestao/formularios/${formulario.id}/export`}
            className="font-bold text-sm px-4 py-2 rounded-full bg-yellow text-yellow-ink"
          >
            Baixar planilha (CSV)
          </a>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[18px] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left font-mono text-[11px] uppercase text-ink-faint px-4 py-3 whitespace-nowrap">
                Enviado em
              </th>
              {campos.map((c) => (
                <th
                  key={c.id}
                  className="text-left font-mono text-[11px] uppercase text-ink-faint px-4 py-3 whitespace-nowrap"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {formulario.respostas.map((r) => {
              const dados: Record<string, string> = JSON.parse(r.respostas);
              return (
                <tr key={r.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 text-xs text-ink-faint whitespace-nowrap">
                    {r.createdAt.toLocaleDateString("pt-BR")}
                  </td>
                  {campos.map((c) => (
                    <td key={c.id} className="px-4 py-3">
                      {dados[c.id] || "—"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {formulario.respostas.length === 0 && (
          <p className="text-sm text-ink-faint p-5">Nenhuma resposta recebida ainda.</p>
        )}
      </div>
    </div>
  );
}
