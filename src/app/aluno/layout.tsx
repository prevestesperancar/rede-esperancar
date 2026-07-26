import { BottomNav } from "@/components/aluno/BottomNav";

export default function AlunoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper pb-24">
      <div className="max-w-md mx-auto px-5 pt-8">{children}</div>
      <BottomNav />
    </div>
  );
}
