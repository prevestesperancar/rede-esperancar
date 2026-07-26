"use client";

import { useTransition } from "react";

export function ApagarItemButton({
  id,
  action,
  confirmMessage = "Tem certeza?",
  label = "Apagar",
}: {
  id: string;
  action: (id: string) => Promise<void>;
  confirmMessage?: string;
  label?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (confirm(confirmMessage)) {
          startTransition(() => action(id));
        }
      }}
      className="text-xs font-bold text-ink-faint hover:text-terracotta disabled:opacity-50 flex-shrink-0"
    >
      {label}
    </button>
  );
}
