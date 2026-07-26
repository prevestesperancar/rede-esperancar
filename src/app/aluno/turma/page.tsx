import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import {
  getEstudanteByUserId,
  getTurmaAtivaDoEstudante,
} from "@/lib/queries/aluno";

export default async function AlunoTurmaPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const estudante = await getEstudanteByUserId(session.user.id);
  if (!estudante) redirect("/login");

  const turma = await getTurmaAtivaDoEstudante(estudante.id);

  if (!turma) {
    return (
      <p className="text-sm text-ink-soft">
        Você ainda não está matriculado em nenhuma turma.
      </p>
    );
  }

  const professoresMap = new Map<
    string,
    {
      nome: string;
      fotoUrl: string | null;
      telefone: string | null;
      disciplinas: Set<string>;
    }
  >();
  for (const td of turma.disciplinas) {
    const existing = professoresMap.get(td.professor.id);
    if (existing) existing.disciplinas.add(td.disciplina.nome);
    else
      professoresMap.set(td.professor.id, {
        nome: td.professor.nome,
        fotoUrl: td.professor.fotoUrl,
        telefone: td.professor.telefone,
        disciplinas: new Set([td.disciplina.nome]),
      });
  }
  const professores = [...professoresMap.values()];

  const whatsappLink = (telefone: string | null) => {
    if (!telefone) return null;
    const numero = telefone.replace(/\D/g, "");
    if (!numero) return null;
    return `https://wa.me/${numero.startsWith("55") ? numero : `55${numero}`}`;
  };
  const colegas = turma.matriculas.filter(
    (m) => m.estudante.userId !== session.user.id
  );

  const initials = (nome: string) =>
    nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Minha turma</h1>
      <p className="text-sm font-semibold text-ink-soft mb-6">
        {turma.nome} · {turma.nucleo.nome}
      </p>

      <div className="font-bold text-sm mb-3">Professores da turma</div>
      <div className="grid grid-cols-2 gap-4 mb-7">
        {professores.map((p) => (
          <div
            key={p.nome}
            className="bg-surface border border-border rounded-2xl p-3.5 text-center"
          >
            <div className="w-14 h-14 rounded-full mx-auto mb-2 relative overflow-hidden bg-ink text-paper flex items-center justify-center font-display text-sm">
              {p.fotoUrl ? (
                <Image
                  src={p.fotoUrl}
                  alt={p.nome}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                initials(p.nome)
              )}
            </div>
            <div className="font-extrabold text-sm">{p.nome}</div>
            <div className="text-xs text-ink-soft mt-0.5">
              {[...p.disciplinas].join(", ")}
            </div>
            {whatsappLink(p.telefone) && (
              <a
                href={whatsappLink(p.telefone)!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-1.5 text-xs font-bold text-teal"
              >
                Falar no WhatsApp →
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="font-bold text-sm mb-3">Colegas de turma</div>
      <div className="bg-surface border border-border rounded-2xl divide-y divide-border">
        {colegas.map((m) => (
          <div key={m.id} className="flex items-center gap-2.5 px-4 py-3">
            <div className="w-1.5 h-1.5 rounded-full bg-teal" />
            <span className="text-sm">{m.estudante.user.nome}</span>
          </div>
        ))}
        {colegas.length === 0 && (
          <p className="text-sm text-ink-faint px-4 py-3">
            Nenhum colega matriculado ainda.
          </p>
        )}
      </div>
    </div>
  );
}
