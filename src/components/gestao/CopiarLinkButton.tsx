"use client";

import { useState } from "react";

export function CopiarLinkButton({ link }: { link: string }) {
  const [copiado, setCopiado] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(link);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }}
      className="font-bold text-sm px-4 py-2 rounded-full border border-border-strong text-ink-soft hover:text-ink flex-shrink-0"
    >
      {copiado ? "Copiado! ✓" : "Copiar link 🔗"}
    </button>
  );
}
