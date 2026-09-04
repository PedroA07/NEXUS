"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";

// useLayoutEffect roda antes da pintura, então o estado inicial escondido é
// aplicado sem o elemento piscar visível primeiro. No servidor ele não existe,
// e é justamente o que queremos: o HTML entregue já vem legível, então quem
// está sem JavaScript lê a página inteira em vez de uma tela vazia.
const useEfeitoDeLayout = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Sobe e revela o bloco quando ele entra em cena. */
export function Revelar({
  children,
  className = "",
  atraso = 0,
}: {
  children: ReactNode;
  className?: string;
  atraso?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduzMovimento = useReducedMotion();

  useEfeitoDeLayout(() => {
    const el = ref.current;
    if (!el || reduzMovimento || !("IntersectionObserver" in window)) return;

    el.style.opacity = "0";
    el.style.transform = "translateY(22px)";
    el.style.transition =
      "opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1)";
    el.style.transitionDelay = `${atraso}ms`;

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observador.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, [reduzMovimento, atraso]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Régua no topo do bloco que se preenche conforme ele atravessa a tela. */
export function LinhaAvanco({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const barraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const barra = barraRef.current;
    if (!el || !barra) return;

    // Um rAF por rajada de scroll: o listener só marca que precisa medir, e a
    // medição (que força layout) acontece uma vez por quadro.
    let agendado = false;
    const medir = () => {
      agendado = false;
      const r = el.getBoundingClientRect();
      const avanco = Math.min(
        1,
        Math.max(0, (window.innerHeight * 0.78 - r.top) / (r.height * 0.72)),
      );
      barra.style.width = `${(avanco * 100).toFixed(1)}%`;
    };
    const aoRolar = () => {
      if (agendado) return;
      agendado = true;
      requestAnimationFrame(medir);
    };

    medir();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);
    return () => {
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
    };
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="absolute left-0 right-0 top-0 h-px bg-linha">
        <div
          ref={barraRef}
          className="h-px bg-ember transition-[width] duration-200 ease-linear"
          style={{ width: "0%" }}
        />
      </div>
      {children}
    </div>
  );
}
