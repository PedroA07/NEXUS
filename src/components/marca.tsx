export function Marca({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-bold text-[15px] inline-flex items-center gap-2 ${className}`}>
      <span className="w-2.5 h-2.5 rounded-[2px] bg-acento rotate-45" aria-hidden />
      Nexus
    </span>
  );
}
