import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEstudanteByUserId, getTurmaAtivaDoEstudante } from "@/lib/queries/aluno";
import { PrintButton } from "@/components/aluno/PrintButton";

export default async function CarteirinhaPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const estudante = await getEstudanteByUserId(session.user.id);
  if (!estudante) redirect("/login");

  const turma = await getTurmaAtivaDoEstudante(estudante.id);
  const anoEmissao = new Date().getFullYear();

  const initials = estudante.user.nome
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div>
      <Link href="/aluno/perfil" className="text-sm font-bold text-ink-soft hover:text-ink">
        ← Perfil
      </Link>

      <h1 className="font-display text-2xl mt-3 mb-6">Minha carteirinha</h1>

      {!turma ? (
        <div className="bg-surface border border-border rounded-2xl p-5 text-center">
          <p className="text-sm text-ink-soft">
            Sua carteirinha fica disponível assim que sua inscrição for aprovada e você entrar
            numa turma.
          </p>
        </div>
      ) : (
        <>
          <div
            id="carteirinha"
            className="bg-terracotta text-paper rounded-[22px] p-6 relative overflow-hidden mb-6 max-w-sm mx-auto shadow-lg"
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="text-lg">✱</span>
              <span className="font-display text-sm tracking-wide">Rede Esperançar</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/10 flex items-center justify-center font-display text-xl flex-shrink-0">
                {estudante.user.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={estudante.user.fotoUrl}
                    alt={estudante.user.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <div className="font-mono text-[10px] font-bold uppercase tracking-wide opacity-60 mb-0.5">
                  Estudante
                </div>
                <div className="font-extrabold text-base leading-tight">{estudante.user.nome}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-white/15">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-wide opacity-60 mb-0.5">
                  Núcleo
                </div>
                <div className="text-sm font-bold">{turma.nucleo.nome}</div>
              </div>
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-wide opacity-60 mb-0.5">
                  Turma
                </div>
                <div className="text-sm font-bold">
                  {turma.nome} · {turma.periodo}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/15 flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wide opacity-60">
                Emitida em {anoEmissao}
              </span>
              <span className="text-lg">✱</span>
            </div>
          </div>

          {!estudante.user.fotoUrl && (
            <p className="text-xs text-ink-faint text-center mb-4">
              Dica: adicione sua foto no perfil pra deixar a carteirinha completa.
            </p>
          )}

          <PrintButton />
        </>
      )}

      <style>{`
        @media print {
          nav, a, button { display: none !important; }
          * {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          #carteirinha {
            box-shadow: none !important;
            margin: 0 auto !important;
          }
        }
      `}</style>
    </div>
  );
}
