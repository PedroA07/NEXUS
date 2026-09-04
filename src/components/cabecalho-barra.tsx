"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Marca } from "./marca";

const ELO = "font-mono text-[11.5px] tracking-[0.16em] uppercase text-tinta2 py-1 border-b border-transparent transition-[color,border-color] duration-[250ms] hover:text-tinta hover:border-ember";

/**
 * `sobreposto` é para a home, onde o hero ocupa a tela inteira: a barra flutua
 * transparente sobre o vídeo e só ganha fundo depois que o hero passa. Nas
 * demais páginas ela fica no fluxo, opaca desde o topo, porque lá não existe
 * mídia atrás dela para justificar a transparência (e conteúdo passando por
 * baixo de uma barra fixa exigiria recuo extra em cada página).
 */
export function CabecalhoBarra({
  sobreposto = false,
  autenticado,
  destino,
  rotulo,
}: {
  sobreposto?: boolean;
  autenticado: boolean;
  destino: string;
  rotulo: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const barra = ref.current;
    if (!barra || !sobreposto) return;

    let ultimoY = window.scrollY;
    let escondida = false;
    let agendado = false;

    const medir = () => {
      agendado = false;
      const y = window.scrollY;
      const passouHero = y > window.innerHeight * 0.6;

      // Some ao descer e volta ao subir, com uma folga de 6px pra tremida do
      // trackpad não ficar ligando e desligando a barra.
      if (y > ultimoY + 6 && y > 140 && !escondida) {
        barra.style.transform = "translateY(-100%)";
        escondida = true;
      } else if (y < ultimoY - 6 && escondida) {
        barra.style.transform = "translateY(0)";
        escondida = false;
      }

      barra.style.background = passouHero ? "rgba(11,13,19,0.86)" : "transparent";
      barra.style.backdropFilter = passouHero ? "blur(14px)" : "none";
      barra.style.borderBottomColor = passouHero ? "#262b3a" : "transparent";
      ultimoY = y;
    };

    const aoRolar = () => {
      if (agendado) return;
      agendado = true;
      requestAnimationFrame(medir);
    };

    medir();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, [sobreposto]);

  return (
    <header
      ref={ref}
      className={
        sobreposto
          ? "fixed top-0 left-0 right-0 z-50 border-b border-transparent transition-[transform,background-color,border-color] duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
          : "sticky top-0 z-50 border-b border-linha bg-papel/90 backdrop-blur"
      }
    >
      <div className="secao h-[76px] flex items-center gap-10">
        <Link href="/" className="shrink-0">
          <Marca />
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          <Link href="/#servicos" className={ELO}>Serviços</Link>
          <Link href="/#quem-somos" className={ELO}>Estúdio</Link>
          <Link href="/#processo" className={ELO}>Processo</Link>
          <Link href="/projetos" className={ELO}>Projetos</Link>
        </nav>

        <div className="flex-1" />

        <Link
          href={autenticado ? destino : "/entrar"}
          className="font-mono text-[11.5px] tracking-[0.16em] uppercase text-tinta2 transition-colors duration-[250ms] hover:text-tinta"
        >
          {rotulo}
        </Link>

        <Link
          href="/solicitar"
          className="hidden sm:inline-flex items-center gap-2.5 font-mono text-[11.5px] tracking-[0.16em] uppercase text-tinta border border-linha2 px-[18px] py-[11px] transition-[background-color,border-color,color] duration-300 hover:bg-tinta hover:text-papel hover:border-tinta"
        >
          Briefing
        </Link>
      </div>
    </header>
  );
}
