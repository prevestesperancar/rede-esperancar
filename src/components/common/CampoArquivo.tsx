"use client";

import { useState } from "react";

// Input de arquivo que valida o tamanho no navegador, antes de qualquer envio —
// evita depender do limite do Server Action (que gera um erro genérico de página).
export function CampoArquivo({
  name,
  tamanhoMaximo,
  className,
  accept,
  required,
}: {
  name: string;
  tamanhoMaximo: number;
  className?: string;
  accept?: string;
  required?: boolean;
}) {
  const [erro, setErro] = useState<string | null>(null);

  return (
    <div>
      <input
        name={name}
        type="file"
        accept={accept}
        required={required}
        className={className}
        onChange={(e) => {
          const arquivo = e.target.files?.[0];
          if (arquivo && arquivo.size > tamanhoMaximo) {
            setErro(
              `O arquivo "${arquivo.name}" tem ${(arquivo.size / (1024 * 1024)).toFixed(1)}MB — o tamanho máximo aceito é ${
                tamanhoMaximo / (1024 * 1024)
              }MB.`
            );
            e.target.value = "";
          } else {
            setErro(null);
          }
        }}
      />
      {erro && <p className="text-xs text-terracotta font-semibold mt-1">{erro}</p>}
    </div>
  );
}
