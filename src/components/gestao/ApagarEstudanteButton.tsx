"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { apagarEstudante } from "@/actions/gestao";

export function ApagarEstudanteButton({ estudanteId }: { estudanteId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Excluir este estudante? Essa ação remove o cadastro, matrículas e histórico dele permanentemente.")) return;
        startTransition(async () => {
          await apagarEstudante(estudanteId);
          router.push("/gestao/estudantes");
        });
      }}
      className="font-bold text-sm px-5 py-2.5 rounded-full border border-terracotta/40 text-terracotta disabled:opacity-60"
    >
      {pending ? "Excluindo…" : "Excluir estudante"}
    </button>
  );
}
