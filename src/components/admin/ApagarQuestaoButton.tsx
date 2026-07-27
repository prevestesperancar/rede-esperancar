"use client";

import { useTransition } from "react";
import { apagarQuestaoBanco } from "@/actions/admin";

export function ApagarQuestaoButton({ questaoId }: { questaoId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Excluir esta questão do banco?")) return;
        startTransition(() => apagarQuestaoBanco(questaoId));
      }}
      className="text-xs font-bold text-terracotta disabled:opacity-60"
    >
      {pending ? "Excluindo…" : "Excluir"}
    </button>
  );
}
