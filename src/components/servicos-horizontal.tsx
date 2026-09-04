"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Servico = {
  numero: string;
  titulo: string;
  corpo: string;
  imagem: string;
};

export function ServicosHorizontal({ servicos }: { servicos: Servico[] }) {
  const pistaRef = useRef<HTMLDivElement>(null);
  const [indice, setIndice] = useState(0);
  const [progresso, setProgresso] = useState(0);

  useEffect(() => {
    const pista = pistaRef.current;
    if (!pista) return;

    const sincronizar = () => {
      const max = pista.scrollWidth - pista.clientWidth;
      const card = pista.querySelector<HTMLElement>("[data-servico]");
      const passo = (card?.offsetWidth ?? 0) + 2;
      setIndice(Math.min(servicos.length - 1, passo ? Math.round(pista.scrollLeft / passo) : 0));
      setProgresso(max > 0 ? 18 + (pista.scrollLeft / max) * 82 : 100);
    };

    pista.addEventListener("scroll", sincronizar, { passive: true });
    window.addEventListener("resize", sincronizar);
    sincronizar();
    return () => {
      pista.removeEventListener("scroll", sincronizar);
      window.removeEventListener("resize", sincronizar);
    };
  }, [servicos.length]);

  const mover = (direcao: number) => {
    const pista = pistaRef.current;
    const card = pista?.querySelector<HTMLElement>("[data-servico]");
    if (!pista || !card) return;
    pista.scrollBy({ left: direcao * (card.offsetWidth + 2), behavior: "smooth" });
  };

  return (
    <>
      <div className="secao flex items-end justify-between gap-8 flex-wrap">
        <div>
          <span className="olho-suave">01 — Serviços</span>
          <h2 className="mt-[22px] text-[clamp(1.8rem,3.6vw,3.2rem)] font-bold leading-[1.04]">
            Seis frentes, um jeito de trabalhar.
          </h2>
        </div>
        <div className="flex items-center gap-5">
          <span className="font-mono text-[12px] tracking-[.14em] text-suave tabular-nums">
            {String(indice + 1).padStart(2, "0")} / {String(servicos.length).padStart(2, "0")}
          </span>
          <div className="flex gap-2">
            <button type="button" aria-label="Serviço anterior" onClick={() => mover(-1)} disabled={indice === 0}
              className="grid h-11 w-11 place-items-center border border-linha2 text-tinta transition-colors hover:border-ember hover:text-ember disabled:pointer-events-none disabled:opacity-30">←</button>
            <button type="button" aria-label="Próximo serviço" onClick={() => mover(1)} disabled={indice === servicos.length - 1}
              className="grid h-11 w-11 place-items-center border border-linha2 text-tinta transition-colors hover:border-ember hover:text-ember disabled:pointer-events-none disabled:opacity-30">→</button>
          </div>
        </div>
      </div>

      <div ref={pistaRef} role="group" aria-label="Serviços da Nexus Hub" tabIndex={0}
        className="mt-[clamp(2.5rem,6vh,4.5rem)] flex gap-0.5 overflow-x-auto scroll-smooth snap-x snap-mandatory px-[clamp(1.5rem,5vw,6rem)] pb-1 scrollbar-none focus-visible:outline-ember">
        {servicos.map((servico) => (
          <Link key={servico.numero} href="/solicitar" data-servico
            className="group relative block w-[min(88vw,520px)] shrink-0 snap-start border border-linha bg-painel transition-colors duration-300 hover:border-ember hover:bg-[#12141c]">
            <div className="relative aspect-[16/11] overflow-hidden bg-papel">
              <Image src={servico.imagem} alt={servico.titulo} fill sizes="(max-width: 640px) 88vw, 520px"
                className="object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-95" />
              <span className="absolute inset-0 bg-gradient-to-t from-papel/90 via-papel/20 to-transparent" />
              <span className="absolute left-5 top-4 font-mono text-[12px] tracking-[.16em] text-ember">{servico.numero}</span>
            </div>
            <div className="p-[clamp(1.375rem,2.6vw,2.125rem)]">
              <h3 className="text-[clamp(1.3rem,2.2vw,1.9rem)] font-bold leading-[1.08] tracking-[-.025em]">{servico.titulo}</h3>
              <p className="mt-3.5 text-[15.5px] text-tinta2 leading-[1.65]">{servico.corpo}</p>
              <span className="mt-6 inline-flex items-center gap-2.5 font-mono text-[11.5px] tracking-[.16em] uppercase text-suave transition-colors group-hover:text-tinta">Começar pelo briefing →</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="secao mt-7">
        <div className="h-px bg-linha"><div className="h-px bg-ember transition-[width] duration-300" style={{ width: `${progresso}%` }} /></div>
        <p className="mt-4 font-mono text-[10.5px] tracking-[.2em] uppercase text-suave">Arraste para o lado</p>
      </div>
    </>
  );
}