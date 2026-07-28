"use client";

import { useTransition } from "react";
import { alternarFavoritoMaterial } from "@/actions/materiais";

export function FavoritarMaterialButton({ materialId, favorito }: { materialId: string; favorito: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => alternarFavoritoMaterial(materialId))}
      className="text-lg leading-none flex-shrink-0 disabled:opacity-50"
      title={favorito ? "Remover dos favoritos" : "Favoritar"}
    >
      {favorito ? "⭐" : "☆"}
    </button>
  );
}
