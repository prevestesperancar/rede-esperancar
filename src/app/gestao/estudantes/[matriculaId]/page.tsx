import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEstudanteDetalhe } from "@/lib/queries/gestao";
import { EditarEstudanteForm } from "@/components/gestao/EditarEstudanteForm";
import { EditarEmailEstudanteForm } from "@/components/gestao/EditarEmailEstudanteForm";
import { ApoioStatusForm } from "@/components/gestao/ApoioStatusForm";
import { ApagarEstudanteButton } from "@/components/gestao/ApagarEstudanteButton";

const STATUS_LABEL: Record<string, string> = {
  EM_AVALIACAO: "Em avaliação",
  PRESENTE: "Presente",
  FALTANTE: "Faltante",
  DESISTENTE: "Desistente",
  TRANSFERIDO: "Transferido",
};

const STATUS_TONE: Record<string, string> = {
  EM_AVALIACAO: "bg-terracotta/10 text-terracotta",
  PRESENTE: "bg-teal/10 text-teal",
  FALTANTE: "bg-yellow/20 text-yellow-ink",
  DESISTENTE: "bg-ink-faint/10 text-ink-faint",
  TRANSFERIDO: "bg-ink-faint/10 text-ink-faint",
};

function idade(dataNascimento: Date | null) {
  if (!dataNascimento) return null;
  const hoje = new Date();
  let anos = hoje.getFullYear() - dataNascimento.getFullYear();
  const m = hoje.getMonth() - dataNascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < dataNascimento.getDate())) anos--;
  return anos;
}

function whatsappLink(telefone: string | null) {
  if (!telefone) return null;
  const numero = telefone.replace(/\D/g, "");
  if (!numero) return null;
  return `https://wa.me/${numero.startsWith("55") ? numero : `55${numero}`}`;
}

export default async function EstudanteDetalhePage({
  params,
}: {
  params: Promise<{ matriculaId: string }>;
}) {
  const { matriculaId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "PROFESSOR") redirect("/gestao/estudantes");
  if (session.user.role !== "ADMIN" && !session.user.nucleoId) redirect("/login");

  const matricula = await getEstudanteDetalhe(
    matriculaId,
    session.user.role === "ADMIN" ? undefined : session.user.nucleoId!
  );
  if (!matricula) notFound();

  const { estudante, turma } = matricula;
  const anos = idade(estudante.dataNascimento);
  const wa = whatsappLink(estudante.user.telefone);

  return (
    <div className="max-w-2xl">
      <Link
        href={session.user.role === "ADMIN" ? "/admin/usuarios" : "/gestao/estudantes"}
        className="text-sm font-bold text-ink-soft hover:text-ink"
      >
        {session.user.role === "ADMIN" ? "← Usuários" : "← Estudantes"}
      </Link>

      <div className="flex items-center gap-3.5 mt-3 mb-7">
        <div className="w-14 h-14 rounded-full bg-ink text-paper flex items-center justify-center font-display text-base flex-shrink-0">
          {estudante.user.nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
        </div>
        <div>
          <h1 className="font-display text-xl">{estudante.user.nome}</h1>
          <p className="text-sm text-ink-soft">
            {turma.nome} · {turma.periodo}
          </p>
        </div>
        <span
          className={`ml-auto text-[11px] font-bold uppercase px-2.5 py-1 rounded-full flex-shrink-0 ${
            STATUS_TONE[estudante.status]
          }`}
        >
          {STATUS_LABEL[estudante.status]}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3.5 mb-6">
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="font-mono text-[11px] font-bold uppercase text-ink-faint mb-1">Contato</div>
          <div className="text-sm">{estudante.user.telefone ?? "—"}</div>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1.5 mb-2 text-xs font-bold text-teal"
            >
              Falar no WhatsApp →
            </a>
          )}
          <div className="mt-2">
            <EditarEmailEstudanteForm estudanteId={estudante.id} email={estudante.user.email} />
          </div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="font-mono text-[11px] font-bold uppercase text-ink-faint mb-1">Idade</div>
          <div className="text-sm">{anos !== null ? `${anos} anos` : "Não informado"}</div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="font-mono text-[11px] font-bold uppercase text-ink-faint mb-1">Escola</div>
          <div className="text-sm">{estudante.escola ?? "Não informado"}</div>
          <div className="text-xs text-ink-faint mt-1">
            {estudante.escolaPublica === null
              ? ""
              : estudante.escolaPublica
              ? "Escola pública"
              : "Escola particular"}
            {estudante.cotista ? " · Cotista" : ""}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="font-mono text-[11px] font-bold uppercase text-ink-faint mb-1">
            Curso desejado
          </div>
          <div className="text-sm">{estudante.cursoDesejado ?? "Não informado"}</div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="font-mono text-[11px] font-bold uppercase text-ink-faint mb-1">
            Universidade desejada
          </div>
          <div className="text-sm">{estudante.universidadeDesejada ?? "Não informado"}</div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="font-mono text-[11px] font-bold uppercase text-ink-faint mb-1">
            Provas que vai fazer
          </div>
          <div className="text-sm">{estudante.provasQueVaiFazer ?? "Não informado"}</div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4 sm:col-span-2">
          <div className="font-mono text-[11px] font-bold uppercase text-ink-faint mb-1">
            Último contato
          </div>
          <div className="text-sm">
            {estudante.ultimoContato
              ? estudante.ultimoContato.toLocaleDateString("pt-BR")
              : "Nenhum registrado"}
          </div>
          {estudante.ultimoContatoObs && (
            <div className="text-xs text-ink-faint mt-1">{estudante.ultimoContatoObs}</div>
          )}
        </div>
      </div>

      {session.user.role === "APOIO_PSICOSSOCIAL" && (
      <div className="bg-surface border border-border rounded-[18px] p-5">
        <div className="font-extrabold text-sm mb-3">Status e acompanhamento</div>
        <ApoioStatusForm estudanteId={estudante.id} status={estudante.status} />
      </div>
      )}

      {session.user.role !== "APOIO_PSICOSSOCIAL" && (
      <div className="bg-surface border border-border rounded-[18px] p-5">
        <div className="font-extrabold text-sm mb-3">Editar informações do estudante</div>
        <EditarEstudanteForm
          estudanteId={estudante.id}
          status={estudante.status}
          telefone={estudante.user.telefone}
          dataNascimento={estudante.dataNascimento}
          sexoGenero={estudante.sexoGenero}
          racaCor={estudante.racaCor}
          bairro={estudante.bairro}
          municipio={estudante.municipio}
          situacaoEscolar={estudante.situacaoEscolar}
          escola={estudante.escola}
          escolaPublica={estudante.escolaPublica}
          cotista={estudante.cotista}
          jaFezEnem={estudante.jaFezEnem}
          cursoDesejado={estudante.cursoDesejado}
          universidadeDesejada={estudante.universidadeDesejada}
          provasQueVaiFazer={estudante.provasQueVaiFazer}
          rendaFamiliar={estudante.rendaFamiliar}
          pessoasEmCasa={estudante.pessoasEmCasa}
          trabalha={estudante.trabalha}
          motivacao={estudante.motivacao}
        />
      </div>
      )}

      {(session.user.role === "COORDENACAO" || session.user.role === "ADMIN") && (
        <div className="mt-4">
          <ApagarEstudanteButton estudanteId={estudante.id} />
        </div>
      )}
    </div>
  );
}
