"use client";

import { useEffect, useState } from "react";

type Foto = { id: string; nome: string; fotoUrl: string };

export function CapaCarrossel({ fotos }: { fotos: Foto[] }) {
  const [ativo, setAtivo] = useState(0);

  useEffect(() => {
    if (fotos.length < 2) return;
    const timer = setInterval(() => {
      setAtivo((i) => (i + 1) % fotos.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [fotos.length]);

  if (fotos.length === 0) return null;

  return (
    <div className="relative rounded-[18px] overflow-hidden shadow-lg aspect-[4/3] bg-ink">
      {fotos.map((foto, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={foto.id}
          src={foto.fotoUrl}
          alt={foto.nome}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === ativo ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
        <span className="bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full">
          {fotos[ativo].nome}
        </span>
        {fotos.length > 1 && (
          <div className="flex gap-1.5">
            {fotos.map((f, i) => (
              <button
                key={f.id}
                type="button"
                aria-label={`Ver foto de ${f.nome}`}
                onClick={() => setAtivo(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === ativo ? "bg-white w-4" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
