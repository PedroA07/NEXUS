"use client";

import Link from "next/link";
import { useId, useRef } from "react";
import { useReducedMotion } from "motion/react";

export type ProjetoDestaque = {
  slug: string;
  titulo: string;
  resumo: string | null;
  categoria: string | null;
  ano: number | null;
};

/**
 * Faixa larga de projeto da Direção A. No lugar de uma captura de tela, uma
 * placa tipográfica sobre trama diagonal, que desliza de leve com o cursor,
 * pra faixa não ficar inerte enquanto não existe imagem de cada projeto.
 */
export function CasoDestaque({
  projeto,
  invertido = false,
  legenda,
  ultimo = false,
}: {
  projeto: ProjetoDestaque;
  invertido?: boolean;
  legenda?: string;
  ultimo?: boolean;
}) {
  const idTrama = useId().replace(/:/g, "");
  const placaRef = useRef<HTMLSpanElement>(null);
  const reduzMovimento = useReducedMotion();

  const aoMover = (ev: React.PointerEvent<HTMLAnchorElement>) => {
    const placa = placaRef.current;
    if (!placa || reduzMovimento) return;
    const r = ev.currentTarget.getBoundingClientRect();
    const dx = ((ev.clientX - r.left) / r.width - 0.5) * 16;
    const dy = ((ev.clientY - r.top) / r.height - 0.5) * 10;
    placa.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
  };

  const aoSair = () => {
    const placa = placaRef.current;
    if (placa) placa.style.transform = "translate3d(0,0,0)";
  };

  const moldura = (
    <div className="relative aspect-[16/10] bg-painel border border-linha overflow-hidden grid place-items-center">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 250"
        preserveAspectRatio="none"
        aria-hidden
        className="absolute inset-0 opacity-50"
      >
        <defs>
          <pattern
            id={idTrama}
            width="7"
            height="7"
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
          >
            <rect width="3.5" height="7" fill="#151824" />
          </pattern>
        </defs>
        <rect width="400" height="250" fill={`url(#${idTrama})`} />
      </svg>
      <span
        ref={placaRef}
        className="relative text-[clamp(1.2rem,3vw,3.4rem)] font-bold tracking-[-0.04em] text-tinta text-center px-6 transition-transform duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)]"
      >
        {projeto.titulo}
      </span>
      {legenda && (
        <span className="absolute left-4 bottom-3.5 font-mono text-[10px] tracking-[0.2em] uppercase text-suave">
          {legenda}
        </span>
      )}
    </div>
  );

  const texto = (
    <div>
      <div className="flex items-baseline gap-4">
        {projeto.categoria && <span className="olho">{projeto.categoria}</span>}
        <span className="h-px w-7 bg-linha2" />
        {projeto.ano && <span className="font-mono text-[12px] text-suave">{projeto.ano}</span>}
      </div>
      <h3 className="mt-[18px] text-[clamp(1.6rem,3vw,2.6rem)] font-bold leading-[1.05] tracking-[-0.03em]">
        {projeto.titulo}
      </h3>
      {projeto.resumo && (
        <p className="mt-4 text-[16px] text-tinta2 leading-[1.65] max-w-[42ch]">{projeto.resumo}</p>
      )}
    </div>
  );

  return (
    <Link
      href={`/projetos#${projeto.slug}`}
      onPointerMove={aoMover}
      onPointerLeave={aoSair}
      className={`grid lg:grid-cols-[1.15fr_1fr] gap-[clamp(1.5rem,4vw,4rem)] items-center border-t border-linha py-[clamp(1.75rem,4vh,3.25rem)] transition-colors duration-[400ms] hover:bg-[#12141c] ${
        ultimo ? "border-b" : ""
      }`}
    >
      {invertido ? (
        <>
          <div className="lg:order-2">{texto}</div>
          <div className="lg:order-1">{moldura}</div>
        </>
      ) : (
        <>
          {moldura}
          {texto}
        </>
      )}
    </Link>
  );
}
