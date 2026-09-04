"use client";

import { useEffect, useRef } from "react";

type Passo = { numero: string; etapa: string; titulo: string; corpo: string };

export function ProcessoHorizontal({ passos }: { passos: Passo[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const contadorRef = useRef<HTMLSpanElement>(null);
  const linhaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;

    let frame = 0;
    const atualizar = () => {
      frame = 0;
      const empilhado = window.innerWidth < 1024;
      if (empilhado) {
        track.style.transform = "none";
        if (linhaRef.current) linhaRef.current.style.width = "100%";
        return;
      }
      const caixa = wrap.getBoundingClientRect();
      const curso = Math.max(1, caixa.height - window.innerHeight);
      const progresso = Math.min(1, Math.max(0, -caixa.top / curso));
      const percurso = Math.max(0, track.scrollWidth - window.innerWidth + 96);
      track.style.transform = `translate3d(${-progresso * percurso}px,0,0)`;
      if (linhaRef.current) linhaRef.current.style.width = `${progresso * 100}%`;
      if (contadorRef.current) {
        const ativo = Math.min(passos.length - 1, Math.floor(progresso * passos.length + 0.001));
        contadorRef.current.textContent = `${String(ativo + 1).padStart(2, "0")} / ${String(passos.length).padStart(2, "0")}`;
        track.querySelectorAll<HTMLElement>("[data-passo]").forEach((el, i) => {
          el.style.opacity = i === ativo ? "1" : ".4";
          el.style.borderColor = i === ativo ? "#3c3566" : "#262b3a";
        });
      }
    };
    const agendar = () => { if (!frame) frame = requestAnimationFrame(atualizar); };
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    atualizar();
    return () => { window.removeEventListener("scroll", agendar); window.removeEventListener("resize", agendar); if (frame) cancelAnimationFrame(frame); };
  }, [passos.length]);

  return (
    <div ref={wrapRef} className="relative h-auto lg:h-[420vh]">
      <div className="relative flex flex-col overflow-visible lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden lg:py-[clamp(5.5rem,13vh,8.25rem)]">
        <div className="secao flex-1 min-h-0 flex items-center">
          <ol ref={trackRef} className="flex w-full flex-col gap-5 lg:w-max lg:flex-row lg:gap-12 lg:pl-0 lg:pr-24 lg:transition-transform lg:duration-100 lg:will-change-transform">
            {passos.map((passo) => (
              <li key={passo.numero} data-passo className="relative w-full border-t border-linha pt-7 lg:w-[min(31vw,390px)] lg:shrink-0 lg:border lg:p-7 transition-[opacity,border-color] duration-300">
                <div className="font-mono text-[clamp(2.6rem,5vw,4.4rem)] font-medium leading-none tracking-[-.04em] text-linha">{passo.numero}</div>
                <span className="mt-5 block olho">{passo.etapa}</span>
                <h3 className="mt-3 text-[clamp(1.1rem,1.5vw,1.35rem)] font-semibold leading-[1.2]">{passo.titulo}</h3>
                <p className="mt-3 text-[15px] text-tinta2 leading-[1.65]">{passo.corpo}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="secao flex items-center gap-5 pt-8">
          <span className="font-mono text-[10.5px] tracking-[.2em] uppercase text-suave whitespace-nowrap">Ideia → Execução</span>
          <div className="h-px flex-1 bg-linha"><div ref={linhaRef} className="h-px bg-ember" style={{ width: "0%" }} /></div>
          <span ref={contadorRef} className="font-mono text-[12px] text-tinta2 tabular-nums whitespace-nowrap">01 / 04</span>
        </div>
      </div>
    </div>
  );
}