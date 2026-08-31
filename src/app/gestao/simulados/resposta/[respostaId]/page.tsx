import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { conceitoUerj } from "@/lib/simulado";

const PERMITIDOS = ["PROFESSOR", "COORDENACAO", "APOIO_PSICOSSOCIAL", "ADMIN"];

export default async function RespostaSimuladoPage({
  params,
}: {
  params: Promise<{ respostaId: string }>;
}) {
  const { respostaId } = await params;
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");
  if (!PERMITIDOS.includes(session.user.role)) redirect("/gestao");

  const resposta = await prisma.simuladoResposta.findUnique({
    where: { id: respostaId },
    include: { simulado: true },
  });

  if (!resposta || resposta.simulado.nucleoId !== session.user.nucleoId) notFound();

  const gabarito = resposta.simulado.gabarito.split(",").map((r) => r.trim().toUpperCase());
  const marcadas = resposta.respostas.split(",").map((r) => r.trim().toUpperCase());
  const totalQuestoes = gabarito.length;

  return (
    <div>
      <Link href="/gestao/simulados" className="text-sm font-bold text-ink-soft hover:text-ink">
        ← Simulados
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap mt-3 mb-6">
        <div>
          <h1 className="font-display text-2xl mb-1">{resposta.nomeCompleto}</h1>
          <p className="text-sm text-ink-soft">
            {resposta.simulado.nome} · {resposta.simulado.data.toLocaleDateString("pt-BR")}
          </p>
        </div>
        {resposta.nota !== null && (
          <div className="bg-ink text-paper rounded-2xl px-5 py-3 text-center">
            <div className="font-display text-2xl">
              {resposta.nota}/{totalQuestoes}
            </div>
            <div className="text-xs text-paper/70 font-bold">
              Conceito {conceitoUerj(resposta.nota, totalQuestoes)}
            </div>
          </div>
        )}
      </div>

      {resposta.fotoCartaoResposta && (
        <div className="mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resposta.fotoCartaoResposta}
            alt={`Cartão-resposta de ${resposta.nomeCompleto}`}
            className="max-w-full rounded-2xl border border-border"
          />
        </div>
      )}

      <div className="bg-surface border border-border rounded-[18px] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left font-mono text-[11px] uppercase text-ink-faint px-4 py-3">Questão</th>
              <th className="text-left font-mono text-[11px] uppercase text-ink-faint px-4 py-3">
                Aluno marcou
              </th>
              <th className="text-left font-mono text-[11px] uppercase text-ink-faint px-4 py-3">Gabarito</th>
              <th className="text-left font-mono text-[11px] uppercase text-ink-faint px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {gabarito.map((certa, i) => {
              const marcada = marcadas[i] ?? "—";
              const anulada = certa === "ANULADA";
              const acertou = anulada || (certa && marcada === certa);
              return (
                <tr key={i} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-2.5 font-mono text-xs text-ink-faint">{i + 1}</td>
                  <td className="px-4 py-2.5 font-bold">{marcada}</td>
                  <td className="px-4 py-2.5 font-bold">{anulada ? "Anulada" : certa}</td>
                  <td className="px-4 py-2.5">
                    {anulada ? (
                      <span className="text-xs font-bold text-ink-faint">conta como acerto</span>
                    ) : acertou ? (
                      <span className="text-teal font-bold">✓</span>
                    ) : (
                      <span className="text-terracotta font-bold">✗</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
