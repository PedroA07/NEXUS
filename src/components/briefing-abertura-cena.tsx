"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Uma ideia solta virando perguntas, depois estrutura e enfim produto. Desenha
 * parte a parte quando a página abre — é a primeira coisa que explica, sem
 * texto, o que o briefing faz com o que a pessoa contar.
 */
export function BriefingAberturaCena() {
  const ref = useRef<SVGSVGElement>(null);
  const reduzMovimento = useReducedMotion();

  useEffect(() => {
    const svg = ref.current;
    if (!svg || reduzMovimento) return;

    const partes = Array.from(svg.querySelectorAll<SVGElement>("[data-ab]"));
    const temporizadores: number[] = [];

    for (const parte of partes) {
      parte.style.opacity = "0";
      parte.style.transition =
        "opacity .7s cubic-bezier(.16,1,.3,1), stroke-dashoffset .9s cubic-bezier(.16,1,.3,1)";
      if (!parte.hasAttribute("data-traco")) continue;
      const traco = parte as SVGGeometryElement;
      if (typeof traco.getTotalLength !== "function") continue;
      try {
        const comprimento = traco.getTotalLength();
        if (comprimento > 0) {
          traco.style.strokeDasharray = String(comprimento);
          traco.style.strokeDashoffset = String(comprimento);
          traco.dataset.compr = String(comprimento);
        }
      } catch {
        /* sem layout ainda: a parte só aparece sem correr o traço */
      }
    }

    for (const parte of partes) {
      const ordem = Number(parte.getAttribute("data-ab")) || 1;
      temporizadores.push(
        window.setTimeout(() => {
          parte.style.opacity = "1";
          if (parte.dataset.compr) parte.style.strokeDashoffset = "0";
        }, 140 + 110 * ordem),
      );
    }

    return () => {
      for (const t of temporizadores) window.clearTimeout(t);
    };
  }, [reduzMovimento]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 320 200"
      className="block w-full h-full"
      role="img"
      aria-label="Uma ideia solta virando perguntas, depois estrutura e enfim um produto"
      style={{ overflow: "visible" }}
    >
      <circle data-ab="1" cx="34" cy="100" r="13" fill="none" stroke="#ff8a65" strokeWidth="1.5" />
      <path data-ab="2" data-traco d="M50 100 h34" fill="none" stroke="#363d50" strokeWidth="1" />
      <path data-ab="3" d="M92 78 h48 v30 h-32 l-8 9 v-9 h-8 z" fill="#101219" stroke="#8474f0" strokeWidth="1.5" />
      <line data-ab="4" data-traco x1="102" y1="90" x2="132" y2="90" stroke="#8474f0" strokeWidth="2" />
      <line data-ab="4" data-traco x1="102" y1="99" x2="122" y2="99" stroke="#4e3fc7" strokeWidth="2" />
      <path data-ab="5" data-traco d="M146 93 h30" fill="none" stroke="#363d50" strokeWidth="1" />
      <rect data-ab="6" x="182" y="60" width="42" height="22" fill="none" stroke="#4a5266" strokeWidth="1" />
      <rect data-ab="6" x="182" y="92" width="42" height="22" fill="none" stroke="#4a5266" strokeWidth="1" />
      <rect data-ab="6" x="182" y="124" width="42" height="22" fill="none" stroke="#4a5266" strokeWidth="1" />
      <path data-ab="7" data-traco d="M224 71 h16 v64 h-16" fill="none" stroke="#363d50" strokeWidth="1" />
      <path data-ab="7" data-traco d="M224 103 h16" fill="none" stroke="#363d50" strokeWidth="1" />
      <rect data-ab="8" x="252" y="62" width="52" height="76" fill="#101219" stroke="#5fd68c" strokeWidth="1.5" />
      <line data-ab="9" data-traco x1="262" y1="80" x2="294" y2="80" stroke="#363d50" strokeWidth="2" />
      <line data-ab="9" data-traco x1="262" y1="92" x2="284" y2="92" stroke="#363d50" strokeWidth="2" />
      <path data-ab="10" data-traco d="M264 116 l7 8 l14 -18" fill="none" stroke="#5fd68c" strokeWidth="2" strokeLinecap="square" />
      <text data-ab="11" x="24" y="168" fontFamily="IBM Plex Mono, monospace" fontSize="9" letterSpacing="1.6" fill="#5c6377">IDEIA</text>
      <text data-ab="11" x="94" y="168" fontFamily="IBM Plex Mono, monospace" fontSize="9" letterSpacing="1.6" fill="#5c6377">PERGUNTAS</text>
      <text data-ab="11" x="180" y="168" fontFamily="IBM Plex Mono, monospace" fontSize="9" letterSpacing="1.6" fill="#5c6377">ESTRUTURA</text>
      <text data-ab="11" x="256" y="168" fontFamily="IBM Plex Mono, monospace" fontSize="9" letterSpacing="1.6" fill="#5c6377">PRODUTO</text>
    </svg>
  );
}
