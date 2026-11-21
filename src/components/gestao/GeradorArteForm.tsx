"use client";

import { useState } from "react";
import { MODELOS, TEXTOS_PRONTOS, LIMITE_TITULO, LIMITE_SUBTITULO, LIMITE_DATA, type Modelo } from "@/lib/arte";

const inputClass =
  "w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink";
const labelClass = "block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1";

export function GeradorArteForm({ quantidadeFotos }: { quantidadeFotos: number }) {
  const [modelo, setModelo] = useState<Modelo>("post");
  const [estilo, setEstilo] = useState<"cartaz" | "foto">("cartaz");
  const [foto, setFoto] = useState(0);
  const [titulo, setTitulo] = useState<string>(TEXTOS_PRONTOS[0].titulo);
  const [subtitulo, setSubtitulo] = useState<string>(TEXTOS_PRONTOS[0].subtitulo);
  const [data, setData] = useState("");
  const [urlGerada, setUrlGerada] = useState<string | null>(null);

  function montarUrl() {
    const params = new URLSearchParams({
      modelo,
      estilo,
      foto: String(foto),
      titulo,
      subtitulo,
      data,
    });
    return `/api/arte?${params.toString()}`;
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
      <div className="flex flex-col gap-4">
        <div>
          <span className={labelClass}>Formato</span>
          <div className="flex gap-2">
            {(Object.keys(MODELOS) as Modelo[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModelo(m)}
                className={`text-xs font-bold px-4 py-2 rounded-full border ${
                  modelo === m ? "bg-ink text-paper border-ink" : "bg-surface border-border-strong"
                }`}
              >
                {MODELOS[m].rotulo}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className={labelClass}>Estilo</span>
          <div className="flex gap-2">
            {(
              [
                ["cartaz", "Cartaz (vermelho e amarelo)"],
                ["foto", "Foto em tela cheia"],
              ] as const
            ).map(([valor, rotulo]) => (
              <button
                key={valor}
                type="button"
                onClick={() => setEstilo(valor)}
                className={`text-xs font-bold px-4 py-2 rounded-full border ${
                  estilo === valor ? "bg-ink text-paper border-ink" : "bg-surface border-border-strong"
                }`}
              >
                {rotulo}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className={labelClass}>Texto pronto</span>
          <div className="flex gap-2 flex-wrap">
            {TEXTOS_PRONTOS.map((t) => (
              <button
                key={t.rotulo}
                type="button"
                onClick={() => {
                  setTitulo(t.titulo);
                  setSubtitulo(t.subtitulo);
                }}
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-surface border border-border-strong"
              >
                {t.rotulo}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>Título</label>
          <input className={inputClass} value={titulo} maxLength={LIMITE_TITULO} onChange={(e) => setTitulo(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Subtítulo</label>
          <input
            className={inputClass}
            value={subtitulo}
            maxLength={LIMITE_SUBTITULO}
            onChange={(e) => setSubtitulo(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Data ou destaque (opcional)</label>
          <input className={inputClass} value={data} maxLength={LIMITE_DATA} onChange={(e) => setData(e.target.value)} placeholder="ex: 15 DE MARÇO" />
        </div>

        <div>
          <label className={labelClass}>Foto</label>
          {quantidadeFotos > 0 ? (
            <select className={inputClass} value={foto} onChange={(e) => setFoto(Number(e.target.value))}>
              {Array.from({ length: quantidadeFotos }, (_, i) => (
                <option key={i} value={i}>
                  Foto {i + 1}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-xs text-ink-faint">Nenhuma foto cadastrada. Suba fotos em Identidade.</p>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setUrlGerada(montarUrl())}
            className="font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink"
          >
            Gerar arte
          </button>
          {urlGerada && (
            <a
              href={urlGerada}
              download={`arte-${estilo}-${modelo}.png`}
              className="font-bold text-sm px-5 py-2.5 rounded-full bg-surface border border-border-strong"
            >
              Baixar PNG
            </a>
          )}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[18px] p-4 flex items-start justify-center min-h-[300px]">
        {urlGerada ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={urlGerada} alt="Pré-visualização da arte" className="max-h-[70vh] w-auto rounded-lg" />
        ) : (
          <p className="text-sm text-ink-faint self-center">Clique em &quot;Gerar arte&quot; para ver a pré-visualização.</p>
        )}
      </div>
    </div>
  );
}
