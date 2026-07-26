"use client";

import { useActionState } from "react";
import { criarNucleo } from "@/actions/admin";

const inputClass =
  "w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink";
const labelClass = "block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1";

export function NovoNucleoForm() {
  const [message, action, pending] = useActionState(criarNucleo, undefined);

  return (
    <form action={action} className="flex flex-col gap-4 max-w-xl">
      <div className="font-extrabold text-sm">Dados do núcleo</div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Nome</label>
          <input name="nome" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Slug (url)</label>
          <input name="slug" required placeholder="ex: zona-norte" className={inputClass} />
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Cidade</label>
          <input name="cidade" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Estado</label>
          <input name="estado" required maxLength={2} placeholder="RJ" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Bairro</label>
          <input name="bairro" className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Endereço</label>
        <input name="endereco" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Descrição</label>
        <textarea name="descricao" rows={3} className={`${inputClass} resize-none`} />
      </div>

      <div className="font-extrabold text-sm mt-2 pt-4 border-t border-border">
        Coordenador responsável
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Nome</label>
          <input name="coordNome" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>E-mail</label>
          <input name="coordEmail" type="email" required className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Senha de acesso</label>
        <input name="coordSenha" type="password" required className={inputClass} />
      </div>

      {message && <p className="text-sm text-terracotta font-semibold">{message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-6 py-3 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Criando…" : "Criar núcleo"}
      </button>
    </form>
  );
}
