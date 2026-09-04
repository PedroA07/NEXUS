"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Marca } from "./marca";

type Props = {
  logado: boolean;
  destino: string;
  rotuloConta: string;
  /** Home tem o hero em vídeo atrás do cabeçalho: começa transparente e só
      ganha fundo depois que o scroll passa da maior parte do hero. Nas
      outras páginas o fundo já nasce sólido, não tem vídeo por trás. */
  transparenteNoTopo?: boolean;
};

const NAV = [
  { href: "/#servicos", rotulo: "Serviços" },
  { href: "/#quem-somos", rotulo: "Estúdio" },
  { href: "/#processo", rotulo: "Processo" },
  { href: "/projetos", rotulo: "Projetos" },
];

export function CabecalhoCliente({ logado, destino, rotuloConta, transparenteNoTopo = false }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const cab = ref.current;
    if (!cab) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (!transparenteNoTopo) {
        cab.style.background = "rgba(11,13,19,0.86)";
        cab.style.backdropFilter = "blur(14px)";
        cab.style.borderBottomColor = "#262b3a";
      }
      return;
    }

    let ultimoY = window.scrollY;
    let escondido = false;

    const aoRolar = () => {
      const y = window.scrollY;
      const passouHero = transparenteNoTopo ? y > window.innerHeight * 0.6 : true;

      if (y > ultimoY + 6 && y > 140 && !escondido) {
        cab.style.transform = "translateY(-100%)";
        escondido = true;
      } else if (y < ultimoY - 6 && escondido) {
        cab.style.transform = "translateY(0)";
        escondido = false;
      }

      cab.style.background = passouHero ? "rgba(11,13,19,0.86)" : "transparent";
      cab.style.backdropFilter = passouHero ? "blur(14px)" : "none";
      cab.style.borderBottomColor = passouHero ? "#262b3a" : "transparent";
      ultimoY = y;
    };

    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, [transparenteNoTopo]);

  return (
    <header
      ref={ref}
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        transition: "transform .5s cubic-bezier(.16,1,.3,1), background-color .4s, border-color .4s",
        borderBottomColor: "transparent",
        background: transparenteNoTopo ? "transparent" : "rgba(11,13,19,0.86)",
        backdropFilter: transparenteNoTopo ? "none" : "blur(14px)",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-[clamp(24px,5vw,96px)] h-[76px] flex items-center gap-10">
        <Link href="/" className="shrink-0">
          <Marca />
        </Link>
        <nav className="hidden lg:flex items-center gap-7 font-mono text-[11.5px] tracking-[0.16em] uppercase text-tinta2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-1 border-b border-transparent transition-colors hover:text-tinta hover:border-ember"
            >
              {item.rotulo}
            </Link>
          ))}
        </nav>
        <div className="flex-1" />
        <Link href={logado ? destino : "/entrar"} className="font-mono text-[11.5px] tracking-[0.16em] uppercase text-tinta2 transition-colors hover:text-tinta">
          {logado ? rotuloConta : "Entrar"}
        </Link>
        <Link
          href="/solicitar"
          className="inline-flex items-center gap-2.5 font-mono text-[11.5px] tracking-[0.16em] uppercase text-tinta border border-linha2 px-[18px] py-[11px] transition-colors hover:bg-tinta hover:text-papel hover:border-tinta"
        >
          Briefing
        </Link>
      </div>
    </header>
  );
}
