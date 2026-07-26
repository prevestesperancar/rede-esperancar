export function Tag({
  tone = "open",
  children,
}: {
  tone?: "open" | "soon";
  children: React.ReactNode;
}) {
  const toneClasses =
    tone === "open"
      ? "bg-teal/10 text-teal"
      : "bg-terracotta/10 text-terracotta";

  return (
    <span
      className={`inline-block text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${toneClasses}`}
    >
      {children}
    </span>
  );
}
