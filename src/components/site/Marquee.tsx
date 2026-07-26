import { Star } from "@/components/ui/Star";

const ITEMS = [
  "Educação não é favor, é direito!",
  "Esperançar é verbo de luta!",
  "Esperançar em todo o Rio de Janeiro",
  "A universidade é nossa!",
];

export function Marquee() {
  const items = [...ITEMS, ...ITEMS];
  return (
    <div className="bg-ink overflow-hidden py-3 group">
      <div className="flex items-center gap-7 w-max animate-marquee group-hover:[animation-play-state:paused]">
        {items.map((text, i) => (
          <span
            key={i}
            className="flex items-center gap-2.5 font-mono text-xs font-bold tracking-wide text-yellow uppercase whitespace-nowrap"
          >
            <Star className="w-2 h-2" />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
