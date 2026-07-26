"use client";

import { useState } from "react";
import { useActionState } from "react";
import { inscrever } from "@/actions/inscricao";
import { MUNICIPIOS_RJ, BAIRROS_RIO } from "@/lib/rj-localidades";

function Erro({ msgs }: { msgs?: string[] }) {
  if (!msgs?.length) return null;
  return <p className="text-xs text-terracotta font-semibold mt-1">{msgs[0]}</p>;
}

const inputClass =
  "w-full rounded-xl border border-border-strong px-4 py-3 text-sm outline-none focus:border-ink bg-surface";
const labelClass = "block text-sm font-semibold mb-1.5";

export function InscricaoForm({
  turmas,
}: {
  turmas: { id: string; nome: string; periodo: string }[];
}) {
  const [state, action, pending] = useActionState(inscrever, undefined);
  const errors = state?.errors;
  const [municipio, setMunicipio] = useState("Rio de Janeiro");
  const [situacaoEscolar, setSituacaoEscolar] = useState("");

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Nome completo</label>
          <input name="nome" required className={inputClass} />
          <Erro msgs={errors?.nome} />
        </div>
        <div>
          <label className={labelClass}>Data de nascimento</label>
          <input name="dataNascimento" type="date" required className={inputClass} />
          <Erro msgs={errors?.dataNascimento} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>CPF</label>
          <input name="cpf" required placeholder="000.000.000-00" className={inputClass} />
          <Erro msgs={errors?.cpf} />
        </div>
        <div>
          <label className={labelClass}>RG</label>
          <input name="rg" required className={inputClass} />
          <Erro msgs={errors?.rg} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>E-mail</label>
          <input name="email" type="email" required className={inputClass} />
          <Erro msgs={errors?.email} />
        </div>
        <div>
          <label className={labelClass}>Telefone / WhatsApp</label>
          <input name="telefone" required className={inputClass} placeholder="(21) 9 9999-0000" />
          <Erro msgs={errors?.telefone} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Sexo / gênero</label>
          <select name="sexoGenero" required className={inputClass} defaultValue="">
            <option value="" disabled>Escolha uma opção</option>
            <option value="Feminino">Feminino</option>
            <option value="Masculino">Masculino</option>
            <option value="Não-binário">Não-binário</option>
            <option value="Prefiro não informar">Prefiro não informar</option>
          </select>
          <Erro msgs={errors?.sexoGenero} />
        </div>
        <div>
          <label className={labelClass}>Raça / cor (autodeclaração)</label>
          <select name="racaCor" required className={inputClass} defaultValue="">
            <option value="" disabled>Escolha uma opção</option>
            <option value="Branca">Branca</option>
            <option value="Preta">Preta</option>
            <option value="Parda">Parda</option>
            <option value="Amarela">Amarela</option>
            <option value="Indígena">Indígena</option>
          </select>
          <Erro msgs={errors?.racaCor} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Município</label>
          <select
            name="municipio"
            required
            className={inputClass}
            value={municipio}
            onChange={(e) => setMunicipio(e.target.value)}
          >
            {MUNICIPIOS_RJ.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <Erro msgs={errors?.municipio} />
        </div>
        <div>
          <label className={labelClass}>Bairro</label>
          {municipio === "Rio de Janeiro" ? (
            <select name="bairro" required className={inputClass} defaultValue="">
              <option value="" disabled>Escolha uma opção</option>
              {BAIRROS_RIO.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          ) : (
            <input name="bairro" required className={inputClass} />
          )}
          <Erro msgs={errors?.bairro} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Qual é a sua situação escolar atual?</label>
        <select
          name="situacaoEscolarOpcao"
          required
          className={inputClass}
          value={situacaoEscolar}
          onChange={(e) => setSituacaoEscolar(e.target.value)}
        >
          <option value="" disabled>Escolha uma opção</option>
          <option value="Estou regularmente matriculado(a) no 3º ano do Ensino Médio">
            Estou regularmente matriculado(a) no 3º ano do Ensino Médio
          </option>
          <option value="Já concluí o Ensino Médio">Já concluí o Ensino Médio</option>
          <option value="Outro">Outro</option>
        </select>
        {situacaoEscolar === "Outro" && (
          <input
            name="situacaoEscolarOutro"
            required
            placeholder="Descreva sua situação escolar"
            className={`${inputClass} mt-2`}
          />
        )}
        <Erro msgs={errors?.situacaoEscolar} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Nome da sua escola</label>
          <input name="escola" required className={inputClass} />
          <Erro msgs={errors?.escola} />
        </div>
        <div>
          <label className={labelClass}>Estuda ou estudou em escola pública?</label>
          <select name="escolaPublica" required className={inputClass} defaultValue="">
            <option value="" disabled>Escolha uma opção</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
          <Erro msgs={errors?.escolaPublica} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Já fez o Enem ou algum vestibular antes?</label>
          <select name="jaFezEnem" required className={inputClass} defaultValue="">
            <option value="" disabled>Escolha uma opção</option>
            <option value="sim">Sim</option>
            <option value="nao">Não, será minha primeira vez</option>
          </select>
          <Erro msgs={errors?.jaFezEnem} />
        </div>
        <div>
          <label className={labelClass}>Curso ou área que pretende cursar</label>
          <input name="cursoDesejado" required className={inputClass} />
          <Erro msgs={errors?.cursoDesejado} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Universidade dos sonhos (opcional)</label>
        <input name="universidadeDesejada" className={inputClass} placeholder="Ex: UERJ, UFRJ..." />
        <Erro msgs={errors?.universidadeDesejada} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Renda familiar mensal per capita</label>
          <select name="rendaFamiliar" required className={inputClass} defaultValue="">
            <option value="" disabled>Escolha uma opção</option>
            <option value="Até R$ 218">Até R$ 218</option>
            <option value="De R$ 218 a R$ 500">De R$ 218 a R$ 500</option>
            <option value="De R$ 500 a R$ 1.000">De R$ 500 a R$ 1.000</option>
            <option value="De R$ 1.000 a R$ 2.000">De R$ 1.000 a R$ 2.000</option>
            <option value="Acima de R$ 2.000">Acima de R$ 2.000</option>
            <option value="Prefiro não informar">Prefiro não informar</option>
          </select>
          <Erro msgs={errors?.rendaFamiliar} />
        </div>
        <div>
          <label className={labelClass}>Pessoas na sua casa (incluindo você)</label>
          <input name="pessoasEmCasa" type="number" min={1} required className={inputClass} />
          <Erro msgs={errors?.pessoasEmCasa} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Atualmente você trabalha?</label>
        <select name="trabalha" required className={inputClass} defaultValue="">
          <option value="" disabled>Escolha uma opção</option>
          <option value="integral">Sim, em período integral</option>
          <option value="meio">Sim, em meio período</option>
          <option value="nao">Não trabalho</option>
        </select>
        <Erro msgs={errors?.trabalha} />
      </div>

      <div>
        <label className={labelClass}>
          Confirmo que tenho disponibilidade para frequentar as aulas aos sábados
        </label>
        <p className="text-xs text-ink-faint mb-2">
          Atenção: a disponibilidade aos sábados é requisito obrigatório. Candidatos sem
          disponibilidade não poderão ser selecionados.
        </p>
        <select name="disponibilidadeSabado" required className={inputClass} defaultValue="">
          <option value="" disabled>Escolha uma opção</option>
          <option value="sim">Sim, tenho disponibilidade aos sábados</option>
          <option value="nao">Não tenho disponibilidade</option>
        </select>
        <Erro msgs={errors?.disponibilidadeSabado} />
      </div>

      <div>
        <label className={labelClass}>
          Por que você quer participar do Pré-Vestibular Social Esperançar?
        </label>
        <textarea name="motivacao" required rows={4} className={`${inputClass} resize-none`} />
        <Erro msgs={errors?.motivacao} />
      </div>

      <div>
        <label className={labelClass}>Turma</label>
        <select name="turmaId" required className={inputClass} defaultValue="">
          <option value="" disabled>Escolha uma turma</option>
          {turmas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome} — {t.periodo}
            </option>
          ))}
        </select>
        <Erro msgs={errors?.turmaId} />
      </div>

      <div>
        <label className={labelClass}>Crie uma senha</label>
        <input name="senha" type="password" required className={inputClass} placeholder="Pelo menos 6 caracteres" />
        <Erro msgs={errors?.senha} />
        <p className="text-xs text-ink-faint mt-1">
          Você usa essa senha pra entrar no portal depois que a coordenação
          aprovar sua inscrição.
        </p>
      </div>

      <label className="flex items-start gap-2.5 text-sm">
        <input type="checkbox" name="termos" required className="w-4 h-4 mt-0.5" />
        <span>
          Declaro que as informações prestadas são verdadeiras e autorizo o
          uso dos meus dados pessoais para fins de gestão, seleção e
          comunicação do projeto, conforme a LGPD (Lei nº 13.709/2018).
        </span>
      </label>
      <Erro msgs={errors?.termos} />

      {state?.message && (
        <p className="text-sm text-terracotta font-semibold">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex items-center justify-center gap-2 font-extrabold text-sm px-6 py-3.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar inscrição →"}
      </button>
    </form>
  );
}
