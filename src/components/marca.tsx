export function Marca({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-bold text-[16px] inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden className="shrink-0">
        <polygon points="16,3 29,16 16,16" fill="var(--color-ember)" />
        <polygon points="29,16 16,29 16,16" fill="var(--color-acento-forte)" />
        <polygon points="16,29 3,16 16,16" fill="#4e3fc7" />
        <polygon points="3,16 16,3 16,16" fill="var(--color-acento)" />
      </svg>
      Nexus
    </span>
  );
}
