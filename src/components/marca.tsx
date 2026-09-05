export function Marca({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Losango do manual da marca: faces cheias até a borda (2..30) e giro de
          cor no sentido horário — ember, roxo, roxo escuro, roxo claro. */}
      <svg viewBox="0 0 32 32" width="20" height="20" aria-hidden className="shrink-0">
        <polygon points="16,2 30,16 16,16" fill="var(--color-ember)" />
        <polygon points="30,16 16,30 16,16" fill="var(--color-acento)" />
        <polygon points="16,30 2,16 16,16" fill="#4e3fc7" />
        <polygon points="2,16 16,2 16,16" fill="var(--color-acento-forte)" />
      </svg>
      <span className="inline-flex items-baseline gap-1.5">
        <span className="font-extrabold text-[15px] tracking-[0.15em] uppercase">Nexus</span>
        <span className="font-mono font-medium text-[13px] tracking-[0.2em] uppercase text-ember">Hub</span>
      </span>
    </span>
  );
}
