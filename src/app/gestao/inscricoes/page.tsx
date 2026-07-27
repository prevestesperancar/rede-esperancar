import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getInscricoesPendentes } from "@/lib/queries/gestao";
import { AprovarRecusarButtons } from "@/components/gestao/AprovarRecusarButtons";

function idade(dataNascimento: Date | null) {
  if (!dataNascimento) return null;
  const hoje = new Date();
  let anos = hoje.getFullYear() - dataNascimento.getFullYear();
  const m = hoje.getMonth() - dataNascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < dataNascimento.getDate())) anos--;
  return anos;
}

function Campo({ label, valor }: { label: string; valor: string | number | null | undefined }) {
  return (
    <div>
      <div className="font-mono text-[10px] font-bold uppercase tracking-wide text-ink-faint">
        {label}
      </div>
      <div className="text-sm">{valor === null || valor === undefined || valor === "" ? "—" : valor}</div>
    </div>
  );
}

export default async function InscricoesPage() {
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");

  const pendentes = await getInscricoesPendentes(session.user.nucleoId);

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Inscrições pendentes</h1>
      <p className="text-sm text-ink-soft mb-7">
        {pendentes.length} aguardando decisão — dados sensíveis (CPF, RG,
        dados bancários) ficam só na planilha de inscrição, não aqui.
      </p>

      <div className="flex flex-col gap-4">
        {pendentes.map((m) => {
          const e = m.estudante;
          const anos = idade(e.dataNascimento);
          return (
            <div
              key={m.id}
              className="bg-surface border border-border rounded-[18px] p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-yellow text-yellow-ink flex items-center justify-center font-display text-sm flex-shrink-0">
                  {e.user.nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{e.user.nome}</div>
                  <div className="text-xs text-ink-faint">
                    {m.turma.nome} · {m.turma.periodo} · {e.user.email}
                  </div>
                </div>
                <AprovarRecusarButtons matriculaId={m.id} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-4 pt-4 border-t border-border">
                <Campo label="Idade" valor={anos !== null ? `${anos} anos` : null} />
                <Campo label="Telefone" valor={e.user.telefone} />
                <Campo label="Sexo/gênero" valor={e.sexoGenero} />
                <Campo label="Raça/cor" valor={e.racaCor} />
                <Campo label="Bairro" valor={e.bairro} />
                <Campo label="Município" valor={e.municipio} />
                <Campo label="Situação escolar" valor={e.situacaoEscolar} />
                <Campo label="Escola" valor={e.escola} />
                <Campo
                  label="Escola pública?"
                  valor={e.escolaPublica === null ? null : e.escolaPublica ? "Sim" : "Não"}
                />
                <Campo label="Cotista?" valor={e.cotista === null ? null : e.cotista ? "Sim" : "Não"} />
                <Campo
                  label="Já fez Enem/vestibular?"
                  valor={e.jaFezEnem === null ? null : e.jaFezEnem ? "Sim" : "Não"}
                />
                <Campo label="Curso desejado" valor={e.cursoDesejado} />
                <Campo label="Universidade desejada" valor={e.universidadeDesejada} />
                <Campo label="Provas que vai fazer" valor={e.provasQueVaiFazer} />
                <Campo label="Renda familiar" valor={e.rendaFamiliar} />
                <Campo label="Pessoas em casa" valor={e.pessoasEmCasa} />
                <Campo label="Trabalha?" valor={e.trabalha === null ? null : e.trabalha ? "Sim" : "Não"} />
                <Campo
                  label="Disponibilidade sábado?"
                  valor={
                    e.disponibilidadeSabado === null
                      ? null
                      : e.disponibilidadeSabado
                      ? "Sim"
                      : "Não"
                  }
                />
              </div>
              {e.motivacao && (
                <div className="mt-3.5 pt-3.5 border-t border-border">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wide text-ink-faint mb-1">
                    Motivação
                  </div>
                  <p className="text-sm text-ink-soft">{e.motivacao}</p>
                </div>
              )}
            </div>
          );
        })}
        {pendentes.length === 0 && (
          <div className="bg-surface border border-border rounded-[18px] p-5">
            <p className="text-sm text-ink-faint py-2">
              Nenhuma inscrição pendente. 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
