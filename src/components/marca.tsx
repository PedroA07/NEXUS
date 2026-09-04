export function Marca({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" width="20" height="20" aria-hidden className="shrink-0">
        <polygon points="16,3 29,16 16,16" fill="var(--color-ember)" />
        <polygon points="29,16 16,29 16,16" fill="var(--color-acento-forte)" />
        <polygon points="16,29 3,16 16,16" fill="#4e3fc7" />
        <polygon points="3,16 16,3 16,16" fill="var(--color-acento)" />
      </svg>
      <span className="font-bold text-[15px] tracking-[0.14em] uppercase">Nexus</span>
    </span>
  );
}
