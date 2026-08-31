"use client";

import { useActionState, useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
import { editarQuestaoBanco } from "@/actions/gestao";

const inputClass =
  "w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink";
const labelClass = "block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1";

type Questao = {
  id: string;
  prova: string;
  materia: string;
  ano: number | null;
  enunciado: string;
  imagemUrl: string | null;
  opcaoA: string;
  opcaoB: string;
  opcaoC: string;
  opcaoD: string;
  opcaoE: string | null;
  respostaCorreta: string;
  subtema: string | null;
};

export function EditarQuestaoForm({
  questao,
  disciplinas,
  aoSalvar,
}: {
  questao: Questao;
  disciplinas: { id: string; nome: string }[];
  aoSalvar: () => void;
}) {
  const [message, action, pending] = useActionState(editarQuestaoBanco, undefined);
  const [imagemUrl, setImagemUrl] = useState(questao.imagemUrl ?? "");
  const [enviandoImagem, setEnviandoImagem] = useState(false);

  async function enviarImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setEnviandoImagem(true);
    try {
      const blob = await upload(arquivo.name, arquivo, {
        access: "public",
        handleUploadUrl: "/api/upload-imagem-questao",
        multipart: true,
      });
      setImagemUrl(blob.url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível enviar a imagem.");
    } finally {
      setEnviandoImagem(false);
      e.target.value = "";
    }
  }

  useEffect(() => {
    if (message === "Questão atualizada!") aoSalvar();
  }, [message, aoSalvar]);

  return (
    <form action={action} className="flex flex-col gap-3 bg-paper rounded-xl p-4 mt-2">
      <input type="hidden" name="questaoId" value={questao.id} />
      <input type="hidden" name="imagemUrl" value={imagemUrl} />

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Prova</label>
          <select name="prova" required defaultValue={questao.prova} className={`${inputClass} bg-surface`}>
            <option value="ENEM">ENEM</option>
            <option value="UERJ">UERJ</option>
            <option value="UERJ-REF">UERJ-REF (só referência, não entra na prática)</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Matéria</label>
          <select name="materia" required defaultValue={questao.materia} className={`${inputClass} bg-surface`}>
            {disciplinas.map((d) => (
              <option key={d.id} value={d.nome}>
                {d.nome}
              </option>
            ))}
            {!disciplinas.some((d) => d.nome === questao.materia) && (
              <option value={questao.materia}>{questao.materia}</option>
            )}
          </select>
        </div>
        <div>
          <label className={labelClass}>Ano</label>
          <input name="ano" type="number" defaultValue={questao.ano ?? ""} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Subtema (interno — só a equipe vê, o aluno não)</label>
        <input name="subtema" defaultValue={questao.subtema ?? ""} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Enunciado</label>
        <textarea name="enunciado" required rows={5} defaultValue={questao.enunciado} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Foto/imagem da questão (opcional — gráfico, mapa, tabela...)</label>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            accept="image/*"
            onChange={enviarImagem}
            disabled={enviandoImagem}
            className="text-xs rounded-lg border border-border-strong px-2 py-1.5 outline-none focus:border-ink file:mr-2 file:rounded-full file:border-0 file:bg-surface file:text-[10px] file:font-bold file:px-2.5 file:py-1 disabled:opacity-60"
          />
          {enviandoImagem && <span className="text-[11px] font-bold text-ink-faint">Enviando…</span>}
          {imagemUrl && !enviandoImagem && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagemUrl} alt="Pré-visualização" className="h-12 rounded-lg border border-border" />
              <button
                type="button"
                onClick={() => setImagemUrl("")}
                className="text-[11px] font-bold text-terracotta"
              >
                Remover imagem
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Alternativa A</label>
          <input name="opcaoA" required defaultValue={questao.opcaoA} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Alternativa B</label>
          <input name="opcaoB" required defaultValue={questao.opcaoB} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Alternativa C</label>
          <input name="opcaoC" required defaultValue={questao.opcaoC} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Alternativa D</label>
          <input name="opcaoD" required defaultValue={questao.opcaoD} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Alternativa E (opcional)</label>
          <input name="opcaoE" defaultValue={questao.opcaoE ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Resposta correta</label>
          <select
            name="respostaCorreta"
            required
            defaultValue={questao.respostaCorreta}
            className={`${inputClass} bg-surface`}
          >
            {["A", "B", "C", "D", "E"].map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      {message && message !== "Questão atualizada!" && (
        <p className="text-sm font-semibold text-terracotta">{message}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending || enviandoImagem}
          className="font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Salvar alterações"}
        </button>
        <button
          type="button"
          onClick={aoSalvar}
          className="font-bold text-sm px-5 py-2.5 rounded-full bg-surface border border-border-strong"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
