"use client";

import { useEffect, useRef } from "react";

type Passo = { numero: string; etapa: string; titulo: string; corpo: string };

function CenaProcesso({ indice }: { indice: number }) {
  const destaque = indice === 3 ? "#5fd68c" : indice === 1 ? "#8474f0" : "#ff8a65";
  return (
    <div className="mb-7 aspect-[16/10] border border-linha bg-[#0d0f16] p-4 text-linha2">
      <svg viewBox="0 0 320 180" className="h-full w-full" aria-hidden="true">
        <rect x="28" y="22" width="180" height="126" fill="#101219" stroke="#363d50" />
        <line x1="28" y1="45" x2="208" y2="45" stroke="#363d50" />
        <circle cx="40" cy="33" r="3" fill="#4a5266" /><circle cx="51" cy="33" r="3" fill="#4a5266" />
        {indice === 0 && <><rect x="48" y="62" width="65" height="9" fill="#4a5266" /><rect x="48" y="80" width="125" height="6" fill="#363d50" /><rect x="48" y="96" width="100" height="6" fill="#363d50" /><rect x="48" y="116" width="55" height="18" fill="none" stroke={destaque} /></>}
        {indice === 1 && <><path d="M118 46v22H62v28M118 68h56v28M118 68v28" fill="none" stroke="#4a5266" /><rect x="38" y="96" width="48" height="27" fill="none" stroke="#363d50" /><rect x="94" y="96" width="48" height="27" fill="none" stroke={destaque} /><rect x="150" y="96" width="48" height="27" fill="none" stroke="#363d50" /></>}
        {indice === 2 && <><rect x="42" y="58" width="54" height="72" fill="none" stroke="#4a5266" /><rect x="108" y="58" width="84" height="30" fill="none" stroke="#4a5266" /><rect x="108" y="98" width="84" height="32" fill="none" stroke={destaque} /><line x1="116" y1="110" x2="170" y2="110" stroke={destaque} strokeWidth="3" /><line x1="116" y1="120" x2="150" y2="120" stroke="#56321f" strokeWidth="3" /></>}
        {indice === 3 && <><rect x="42" y="58" width="130" height="58" fill="none" stroke="#4a5266" /><line x1="58" y1="76" x2="142" y2="76" stroke="#5c6377" strokeWidth="3" /><line x1="58" y1="90" x2="124" y2="90" stroke="#363d50" strokeWidth="3" /><circle cx="244" cy="72" r="22" fill="none" stroke={destaque} strokeWidth="2" /><path d="M233 72l7 7 15-18" fill="none" stroke={destaque} strokeWidth="3" /></>}
        <path d="M224 132h58" stroke="#363d50" /><path d="M224 144h38" stroke="#4e3fc7" />
      </svg>
    </div>
  );
}

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
      const percurso = Math.max(0, track.scrollWidth - window.innerWidth + 160);
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
          <ol ref={trackRef} className="flex w-full flex-col gap-5 lg:w-max lg:flex-row lg:gap-[clamp(2rem,5vw,5rem)] lg:pl-0 lg:pr-40 lg:transition-transform lg:duration-100 lg:will-change-transform">
            {passos.map((passo, indice) => (
              <li key={passo.numero} data-passo className="relative w-full border-t border-linha pt-7 lg:w-[min(34vw,460px)] lg:shrink-0 lg:border lg:p-8 transition-[opacity,border-color] duration-300">
                <CenaProcesso indice={indice} />
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