"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser, SUPABASE_UPLOADS_BUCKET } from "@/lib/supabase-browser";
import { definirLogoNucleo, adicionarFotoNucleo, removerFotoNucleo, definirPaletaNucleo } from "@/actions/identidade";
import { extrairPaleta } from "@/lib/paleta";

const MAX_FOTOS = 5;
const TAMANHO_MAX_MB = 8;

async function enviarArquivo(arquivo: File, tipo: "logo" | "foto"): Promise<string> {
  if (arquivo.size > TAMANHO_MAX_MB * 1024 * 1024) {
    throw new Error(`O arquivo tem mais de ${TAMANHO_MAX_MB}MB. Reduza o tamanho e tente de novo.`);
  }
  const resposta = await fetch("/api/upload-identidade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nomeArquivo: arquivo.name, tipo }),
  });
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.error ?? "Não foi possível gerar o envio.");

  const { error } = await supabaseBrowser.storage
    .from(SUPABASE_UPLOADS_BUCKET)
    .uploadToSignedUrl(dados.path, dados.token, arquivo);
  if (error) throw new Error(error.message);
  return dados.publicUrl as string;
}

export function IdentidadeForm({ logoUrl, fotos, paleta }: { logoUrl: string | null; fotos: string[]; paleta: string[] }) {
  const router = useRouter();
  const [cores, setCores] = useState<string[]>(paleta);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function trocarLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setEnviando(true);
    setErro(null);
    try {
      const url = await enviarArquivo(arquivo, "logo");
      await definirLogoNucleo(url);
      // Sugere a paleta a partir da nova logo; a coordenação pode alterar depois.
      const sugestao = await extrairPaleta(arquivo);
      if (sugestao.length > 0) {
        setCores(sugestao);
        await definirPaletaNucleo(sugestao);
      }
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar a logo.");
    } finally {
      setEnviando(false);
      e.target.value = "";
    }
  }

  async function adicionarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setEnviando(true);
    setErro(null);
    try {
      const url = await enviarArquivo(arquivo, "foto");
      await adicionarFotoNucleo(url);
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar a foto.");
    } finally {
      setEnviando(false);
      e.target.value = "";
    }
  }

  async function salvarCores() {
    setEnviando(true);
    setErro(null);
    try {
      await definirPaletaNucleo(cores);
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar as cores.");
    } finally {
      setEnviando(false);
    }
  }

  async function remover(url: string) {
    setEnviando(true);
    setErro(null);
    try {
      await removerFotoNucleo(url);
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao remover a foto.");
    } finally {
      setEnviando(false);
    }
  }

  const inputClass =
    "text-xs rounded-lg border border-border-strong px-2 py-1.5 outline-none focus:border-ink file:mr-2 file:rounded-full file:border-0 file:bg-surface file:text-[10px] file:font-bold file:px-2.5 file:py-1 disabled:opacity-60";

  return (
    <div className="flex flex-col gap-8">
      <section className="bg-surface border border-border rounded-[18px] p-5">
        <div className="font-extrabold text-sm mb-1">Logo do pré-vestibular</div>
        <p className="text-xs text-ink-faint mb-3">PNG com fundo transparente funciona melhor.</p>
        <div className="flex items-center gap-4 flex-wrap">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo do núcleo" className="h-20 rounded-lg border border-border bg-paper p-2" />
          ) : (
            <div className="h-20 w-20 rounded-lg border border-dashed border-border-strong flex items-center justify-center text-[11px] text-ink-faint">
              sem logo
            </div>
          )}
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={trocarLogo} disabled={enviando} className={inputClass} />
        </div>
      </section>

      {cores.length > 0 && (
        <section className="bg-surface border border-border rounded-[18px] p-5">
          <div className="font-extrabold text-sm mb-1">Paleta de cores</div>
          <p className="text-xs text-ink-faint mb-3">
            Sugerida a partir da logo. A primeira cor é o destaque das artes. Digite o código no formato #RRGGBB para alterar.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {cores.map((cor, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="h-10 w-10 rounded-lg border border-border flex-shrink-0" style={{ background: cor }} />
                <input
                  value={cor}
                  maxLength={7}
                  onChange={(e) => setCores(cores.map((c, j) => (j === i ? e.target.value.toUpperCase() : c)))}
                  className="w-28 rounded-lg border border-border-strong px-2.5 py-1.5 text-sm font-mono outline-none focus:border-ink"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={salvarCores}
            disabled={enviando || cores.some((c) => !/^#[0-9A-F]{6}$/.test(c))}
            className="mt-4 font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
          >
            Salvar cores
          </button>
        </section>
      )}

      <section className="bg-surface border border-border rounded-[18px] p-5">
        <div className="font-extrabold text-sm mb-1">Fotos do núcleo ({fotos.length}/{MAX_FOTOS})</div>
        <p className="text-xs text-ink-faint mb-3">
          Usadas nas artes de redes sociais. Você pode trocar ou remover a qualquer momento.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          {fotos.map((url) => (
            <div key={url} className="flex flex-col gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Foto do núcleo" className="w-full aspect-square object-cover rounded-xl border border-border" />
              <button
                type="button"
                onClick={() => remover(url)}
                disabled={enviando}
                className="text-[11px] font-bold text-terracotta disabled:opacity-60"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
        {fotos.length < MAX_FOTOS ? (
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={adicionarFoto} disabled={enviando} className={inputClass} />
        ) : (
          <p className="text-xs text-ink-faint">Limite de {MAX_FOTOS} fotos atingido. Remova uma para adicionar outra.</p>
        )}
      </section>

      {enviando && <p className="text-xs font-bold text-ink-faint">Enviando…</p>}
      {erro && <p className="text-xs font-semibold text-terracotta">{erro}</p>}
    </div>
  );
}
