"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { importarEstudantesPlanilha } from "@/actions/gestao";
import { parseCsv } from "@/lib/csv";
import { CAMPOS_IMPORTACAO } from "@/lib/import-planilha-campos";

const PALPITES: { termos: string[]; campo: string }[] = [
  { termos: ["e-mail", "email"], campo: "email" },
  { termos: ["nome completo", "nome"], campo: "nome" },
  { termos: ["celular", "telefone", "whatsapp"], campo: "telefone" },
  { termos: ["nascimento"], campo: "dataNascimento" },
  { termos: ["situacao escolar", "serie", "ano escolar"], campo: "situacaoEscolar" },
  { termos: ["nome da escola", "escola"], campo: "escola" },
  { termos: ["escola publica", "rede publica"], campo: "escolaPublica" },
  { termos: ["cidade", "municipio"], campo: "municipio" },
  { termos: ["bairro"], campo: "bairro" },
  { termos: ["sexo", "genero"], campo: "sexoGenero" },
  { termos: ["raca", "cor"], campo: "racaCor" },
  { termos: ["curso desejado", "curso"], campo: "cursoDesejado" },
  { termos: ["provas que vai fazer", "vestibular"], campo: "provasQueVaiFazer" },
  { termos: ["ja fez", "primeira vez"], campo: "jaFezEnem" },
  { termos: ["renda"], campo: "rendaFamiliar" },
  { termos: ["pessoas na", "pessoas em casa", "moradores"], campo: "pessoasEmCasa" },
  { termos: ["trabalha"], campo: "trabalha" },
  { termos: ["motivacao", "por que voce quer", "por que você quer"], campo: "motivacao" },
];

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function gerarPalpites(cabecalho: string[]): Record<number, string> {
  const usados = new Set<string>();
  const mapa: Record<number, string> = {};
  for (const { termos, campo } of PALPITES) {
    if (usados.has(campo)) continue;
    const index = cabecalho.findIndex(
      (h, i) => mapa[i] === undefined && termos.some((t) => normalizar(h).includes(t))
    );
    if (index !== -1) {
      mapa[index] = campo;
      usados.add(campo);
    }
  }
  cabecalho.forEach((_, i) => {
    if (mapa[i] === undefined) mapa[i] = "ignorar";
  });
  return mapa;
}

export function ImportarPlanilhaForm({
  turmas,
}: {
  turmas: { id: string; nome: string; periodo: string }[];
}) {
  const [message, action, pending] = useActionState(importarEstudantesPlanilha, undefined);
  const [cabecalho, setCabecalho] = useState<string[] | null>(null);
  const [mapeamento, setMapeamento] = useState<Record<number, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (message?.startsWith("Importação concluída")) {
      setCabecalho(null);
      setMapeamento({});
      formRef.current?.reset();
    }
  }, [message]);

  async function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) {
      setCabecalho(null);
      return;
    }
    const texto = await arquivo.text();
    const linhas = parseCsv(texto);
    if (linhas.length === 0) return;
    const header = linhas[0];
    setCabecalho(header);
    setMapeamento(gerarPalpites(header));
  }

  const mapeamentoJson = JSON.stringify(mapeamento);
  const emailMapeado = Object.values(mapeamento).includes("email");
  const nomeMapeado = Object.values(mapeamento).includes("nome");

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <div className="font-extrabold text-sm">Importar alunos de um arquivo CSV</div>
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
            Turma
          </label>
          <select
            name="turmaId"
            required
            className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink bg-surface"
          >
            <option value="">Selecione a turma</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome} · {t.periodo}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
            Arquivo CSV
          </label>
          <input
            name="arquivo"
            type="file"
            accept=".csv,text/csv"
            required
            onChange={handleArquivo}
            className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink file:mr-3 file:rounded-full file:border-0 file:bg-yellow file:text-yellow-ink file:font-bold file:text-xs file:px-3 file:py-1.5"
          />
        </div>
      </div>

      {cabecalho && (
        <div className="bg-paper rounded-xl p-3.5 flex flex-col gap-2">
          <div className="text-xs font-bold text-ink-faint uppercase tracking-wide">
            Diga o que cada coluna da planilha significa
          </div>
          {cabecalho.map((h, i) => (
            <div key={i} className="grid sm:grid-cols-2 gap-2 items-center">
              <span className="text-xs text-ink-soft truncate" title={h}>
                {h || `(coluna ${i + 1})`}
              </span>
              <select
                value={mapeamento[i] ?? "ignorar"}
                onChange={(e) => setMapeamento((prev) => ({ ...prev, [i]: e.target.value }))}
                className="w-full rounded-lg border border-border-strong px-2.5 py-1.5 text-xs outline-none focus:border-ink bg-surface"
              >
                {CAMPOS_IMPORTACAO.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {(!emailMapeado || !nomeMapeado) && (
            <p className="text-xs font-semibold text-terracotta">
              Mapeie ao menos uma coluna para Nome completo e outra para E-mail.
            </p>
          )}
        </div>
      )}

      <input type="hidden" name="mapeamento" value={mapeamentoJson} />

      <button
        type="submit"
        disabled={pending || !cabecalho || !emailMapeado || !nomeMapeado}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Importando…" : "Importar"}
      </button>
      {message && <p className="text-xs font-semibold text-ink-soft">{message}</p>}
    </form>
  );
}
