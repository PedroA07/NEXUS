export function Marca({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" width="20" height="20" aria-hidden className="shrink-0">
        <polygon points="16,3 29,16 16,16" fill="var(--color-ember)" />
        <polygon points="29,16 16,29 16,16" fill="var(--color-acento-forte)" />
        <polygon points="16,29 3,16 16,16" fill="#4e3fc7" />
        <polygon points="3,16 16,3 16,16" fill="var(--color-acento)" />
      </svg>
      <span className="inline-flex items-baseline gap-1.5">
        <span className="font-extrabold text-[15px] tracking-[0.15em] uppercase">Nexus</span>
        <span className="font-mono font-medium text-[13px] tracking-[0.2em] uppercase text-ember">Hub</span>
      </span>
    </span>
  );
}
