"use client";

import { useState } from "react";
import { useActionState } from "react";
import { atualizarEstudante } from "@/actions/gestao";
import { MUNICIPIOS_RJ, BAIRROS_RIO } from "@/lib/rj-localidades";
import {
  SEXO_GENERO_OPCOES,
  RACA_COR_OPCOES,
  SITUACAO_ESCOLAR_OPCOES,
  PROVAS_OPCOES,
  RENDA_FAMILIAR_OPCOES,
} from "@/lib/estudante-opcoes";

const STATUS_OPTIONS = [
  { value: "EM_AVALIACAO", label: "Em avaliação" },
  { value: "PRESENTE", label: "Ativo" },
  { value: "FALTANTE", label: "Faltante" },
  { value: "DESISTENTE", label: "Desistente" },
  { value: "TRANSFERIDO", label: "Transferido" },
];

const inputClass =
  "w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink";
const labelClass = "block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1";

function boolValue(v: boolean | null) {
  if (v === null) return "";
  return v ? "sim" : "nao";
}

export function EditarEstudanteForm({
  estudanteId,
  nome,
  status,
  telefone,
  dataNascimento,
  sexoGenero,
  racaCor,
  bairro,
  municipio,
  situacaoEscolar,
  escola,
  escolaPublica,
  cotista,
  jaFezEnem,
  cursoDesejado,
  universidadeDesejada,
  provasQueVaiFazer,
  rendaFamiliar,
  pessoasEmCasa,
  trabalha,
  motivacao,
}: {
  estudanteId: string;
  nome: string;
  status: string;
  telefone: string | null;
  dataNascimento: Date | null;
  sexoGenero: string | null;
  racaCor: string | null;
  bairro: string | null;
  municipio: string | null;
  situacaoEscolar: string | null;
  escola: string | null;
  escolaPublica: boolean | null;
  cotista: boolean | null;
  jaFezEnem: boolean | null;
  cursoDesejado: string | null;
  universidadeDesejada: string | null;
  provasQueVaiFazer: string | null;
  rendaFamiliar: string | null;
  pessoasEmCasa: number | null;
  trabalha: boolean | null;
  motivacao: string | null;
}) {
  const [message, action, pending] = useActionState(atualizarEstudante, undefined);
  const [municipioSel, setMunicipioSel] = useState(municipio ?? "Rio de Janeiro");

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="estudanteId" value={estudanteId} />

      <div>
        <label className={labelClass}>Nome completo</label>
        <input name="nome" defaultValue={nome} required className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Status do estudante</label>
        <select name="status" defaultValue={status} className={`${inputClass} bg-surface`}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Telefone / WhatsApp</label>
          <input name="telefone" defaultValue={telefone ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Data de nascimento</label>
          <input
            name="dataNascimento"
            type="date"
            defaultValue={dataNascimento ? dataNascimento.toISOString().slice(0, 10) : ""}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Sexo/gênero</label>
          <select name="sexoGenero" defaultValue={sexoGenero ?? ""} className={`${inputClass} bg-surface`}>
            <option value="">Não informado</option>
            {SEXO_GENERO_OPCOES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Raça/cor</label>
          <select name="racaCor" defaultValue={racaCor ?? ""} className={`${inputClass} bg-surface`}>
            <option value="">Não informado</option>
            {RACA_COR_OPCOES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Município</label>
          <select
            name="municipio"
            value={municipioSel}
            onChange={(e) => setMunicipioSel(e.target.value)}
            className={`${inputClass} bg-surface`}
          >
            {MUNICIPIOS_RJ.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Bairro</label>
          {municipioSel === "Rio de Janeiro" ? (
            <select name="bairro" defaultValue={bairro ?? ""} className={`${inputClass} bg-surface`}>
              <option value="">Não informado</option>
              {BAIRROS_RIO.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          ) : (
            <input name="bairro" defaultValue={bairro ?? ""} className={inputClass} />
          )}
        </div>
      </div>

      <div>
        <label className={labelClass}>Situação escolar</label>
        <select
          name="situacaoEscolar"
          defaultValue={situacaoEscolar ?? ""}
          className={`${inputClass} bg-surface`}
        >
          <option value="">Não informado</option>
          {SITUACAO_ESCOLAR_OPCOES.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Escola</label>
          <input name="escola" defaultValue={escola ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Escola pública?</label>
          <select name="escolaPublica" defaultValue={boolValue(escolaPublica)} className={`${inputClass} bg-surface`}>
            <option value="">Não informado</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Cotista?</label>
          <select name="cotista" defaultValue={boolValue(cotista)} className={`${inputClass} bg-surface`}>
            <option value="">Não informado</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Já fez Enem/vestibular?</label>
          <select name="jaFezEnem" defaultValue={boolValue(jaFezEnem)} className={`${inputClass} bg-surface`}>
            <option value="">Não informado</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Provas que vai fazer</label>
          <select
            name="provasQueVaiFazer"
            defaultValue={provasQueVaiFazer ?? ""}
            className={`${inputClass} bg-surface`}
          >
            <option value="">Não informado</option>
            {PROVAS_OPCOES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Curso desejado</label>
          <input name="cursoDesejado" defaultValue={cursoDesejado ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Universidade desejada</label>
          <input
            name="universidadeDesejada"
            defaultValue={universidadeDesejada ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Renda familiar</label>
          <select
            name="rendaFamiliar"
            defaultValue={rendaFamiliar ?? ""}
            className={`${inputClass} bg-surface`}
          >
            <option value="">Não informado</option>
            {RENDA_FAMILIAR_OPCOES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Pessoas em casa</label>
          <input
            name="pessoasEmCasa"
            type="number"
            min={1}
            defaultValue={pessoasEmCasa ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Trabalha?</label>
          <select name="trabalha" defaultValue={boolValue(trabalha)} className={`${inputClass} bg-surface`}>
            <option value="">Não informado</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Motivação</label>
        <textarea
          name="motivacao"
          defaultValue={motivacao ?? ""}
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className={labelClass}>Registrar novo contato (opcional)</label>
        <textarea
          name="ultimoContatoObs"
          rows={2}
          placeholder="Ex: Ligamos hoje, confirmou presença no sábado."
          className={`${inputClass} resize-none`}
        />
      </div>

      {message && <p className="text-sm font-semibold text-teal">{message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar alterações"}
      </button>
    </form>
  );
}
