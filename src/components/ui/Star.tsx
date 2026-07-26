export function Star({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block bg-star ${className}`}
      style={{
        clipPath:
          "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
      }}
      aria-hidden="true"
    />
  );
}
