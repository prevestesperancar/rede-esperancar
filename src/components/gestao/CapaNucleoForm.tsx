"use client";

import { useActionState } from "react";
import { atualizarFotoNucleo } from "@/actions/gestao";
import { CampoArquivo } from "@/components/common/CampoArquivo";
import { TAMANHO_MAXIMO_FOTO } from "@/lib/upload-limits";

export function CapaNucleoForm({ fotoUrl }: { fotoUrl: string | null }) {
  const [message, action, pending] = useActionState(atualizarFotoNucleo, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      {fotoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={fotoUrl} alt="Capa do núcleo" className="w-full max-w-xs rounded-2xl object-cover aspect-[4/3]" />
      )}
      <p className="text-xs text-ink-faint">
        Essa foto aparece na capa do site, alternando com as fotos dos outros núcleos.
        Só é possível ter uma foto de capa por núcleo — enviar uma nova substitui a anterior.
      </p>
      <CampoArquivo
        name="foto"
        accept="image/*"
        required
        tamanhoMaximo={TAMANHO_MAXIMO_FOTO}
        className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink file:mr-3 file:rounded-full file:border-0 file:bg-yellow file:text-yellow-ink file:font-bold file:text-xs file:px-3 file:py-1.5"
      />
      {message && <p className="text-sm font-semibold text-teal">{message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar foto de capa"}
      </button>
    </form>
  );
}
