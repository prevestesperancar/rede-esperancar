import Link from "next/link";
import { NovoNucleoForm } from "@/components/admin/NovoNucleoForm";

export default function NovoNucleoPage() {
  return (
    <div>
      <Link href="/admin" className="text-sm font-bold text-ink-soft hover:text-ink">
        ← Núcleos
      </Link>
      <h1 className="font-display text-2xl mt-3 mb-7">Criar novo núcleo</h1>
      <NovoNucleoForm />
    </div>
  );
}
