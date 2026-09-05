"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

export type Passo = {
  numero: string;
  rotulo: string;
  titulo: string;
  paragrafos: [string, string];
};

/**
 * Linha do tempo vertical do processo: espinha central que se preenche
 * conforme a seção atravessa a tela, nós em losango que acendem no passo
 * corrente e cenas técnicas que se desenham parte por parte quando entram.
 *
 * A alternância esquerda/direita é só desktop. Abaixo de 1024px a espinha
 * encosta na margem esquerda e tudo empilha numa coluna só — cena em cima,
 * texto embaixo — porque com 20px de calha não sobra medida para duas colunas.
 */
export function ProcessoTrilho({ passos }: { passos: Passo[] }) {
  const trilhoRef = useRef<HTMLDivElement>(null);
  const linhaRef = useRef<HTMLSpanElement>(null);
  const fimRef = useRef<HTMLSpanElement>(null);
  const contadorRef = useRef<HTMLSpanElement>(null);
  const reduzMovimento = useReducedMotion();

  useEffect(() => {
    const trilho = trilhoRef.current;
    if (!trilho) return;

    const artigos = Array.from(trilho.querySelectorAll<HTMLElement>("[data-passo]"));
    if (!artigos.length) return;

    // Sem movimento: tudo já nasce aceso e desenhado, e não há loop de scroll.
    if (reduzMovimento) {
      if (linhaRef.current) linhaRef.current.style.height = "100%";
      if (fimRef.current) {
        fimRef.current.style.borderColor = "#5fd68c";
        fimRef.current.style.background = "#5fd68c";
      }
      return;
    }

    const partesDe = (artigo: HTMLElement) =>
      Array.from(artigo.querySelectorAll<SVGElement>("[data-parte]"));

    // Estado inicial das cenas: cada parte escondida e, nos traços, o contorno
    // recolhido para que o desenho corra ao invés de aparecer pronto.
    for (const artigo of artigos) {
      for (const parte of partesDe(artigo)) {
        parte.style.opacity = "0";
        parte.style.transform = "translate3d(0,10px,0)";
        parte.style.transformOrigin = "center";
        parte.style.transition =
          "opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1), stroke-dashoffset .9s cubic-bezier(.16,1,.3,1)";
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
          /* getTotalLength lança em nó ainda sem layout; a parte só não anima */
        }
      }
    }

    const temporizadores: number[] = [];
    const desenhadas = new WeakSet<HTMLElement>();
    const desenhar = (artigo: HTMLElement) => {
      if (desenhadas.has(artigo)) return;
      desenhadas.add(artigo);
      for (const parte of partesDe(artigo)) {
        const ordem = Number(parte.getAttribute("data-parte")) || 1;
        temporizadores.push(
          window.setTimeout(() => {
            parte.style.opacity = "1";
            parte.style.transform = "translate3d(0,0,0)";
            if (parte.dataset.compr) parte.style.strokeDashoffset = "0";
          }, 90 * ordem),
        );
      }
    };

    let ativoAnterior = -2;
    let agendado = false;

    const medir = () => {
      agendado = false;
      const alvo = window.innerHeight * 0.62;
      const r = trilho.getBoundingClientRect();
      const preenchido = Math.min(1, Math.max(0, (alvo - r.top) / Math.max(1, r.height)));
      if (linhaRef.current) linhaRef.current.style.height = `${(preenchido * 100).toFixed(1)}%`;

      let ativo = -1;
      artigos.forEach((artigo, i) => {
        if (artigo.getBoundingClientRect().top < alvo) ativo = i;
      });

      // Desenha o passo corrente e adianta o seguinte, para a cena já estar
      // montada quando ele chega no alvo em vez de começar a nascer ali.
      if (ativo >= 0) desenhar(artigos[ativo]);
      const proximo = artigos[ativo + 1];
      if (proximo && proximo.getBoundingClientRect().top < window.innerHeight * 0.9) {
        desenhar(proximo);
      }

      if (ativo === ativoAnterior) return;
      ativoAnterior = ativo;

      artigos.forEach((artigo, i) => {
        const ligado = i <= ativo;
        const agora = i === ativo;
        const no = artigo.querySelector<HTMLElement>("[data-no]");
        const rotulo = artigo.querySelector<HTMLElement>("[data-rotulo]");
        const figura = artigo.querySelector<HTMLElement>("[data-figura]");
        if (no) {
          no.style.borderColor = ligado ? "#ff8a65" : "#4a5266";
          no.style.background = agora ? "#ff8a65" : "#0b0d13";
          no.style.transform = agora ? "rotate(45deg) scale(1.35)" : "rotate(45deg) scale(1)";
        }
        if (rotulo) rotulo.style.color = agora ? "#ff8a65" : ligado ? "#a6adc0" : "#5c6377";
        if (figura) {
          figura.style.borderColor = agora ? "#3c3566" : "#262b3a";
          figura.style.background = agora ? "#101219" : "#0d0f16";
        }
      });

      if (fimRef.current) {
        const completo = ativo >= artigos.length - 1;
        fimRef.current.style.borderColor = completo ? "#5fd68c" : "#4a5266";
        fimRef.current.style.background = completo ? "#5fd68c" : "#0b0d13";
      }
      if (contadorRef.current) {
        contadorRef.current.textContent = `${String(Math.max(0, ativo) + 1).padStart(2, "0")} / ${String(artigos.length).padStart(2, "0")}`;
      }
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
      for (const t of temporizadores) window.clearTimeout(t);
    };
  }, [reduzMovimento]);

  return (
    <>
      <div ref={trilhoRef} className="relative max-w-[1180px] mx-auto mt-[clamp(40px,7vh,88px)]">
        <span
          aria-hidden
          className="absolute left-[9px] lg:left-1/2 top-0 bottom-0 w-px bg-[#1c2130] lg:-translate-x-1/2"
        >
          <span
            ref={linhaRef}
            className="block w-px bg-gradient-to-b from-acento to-ember"
            style={{ height: "0%" }}
          />
        </span>

        {passos.map((passo, i) => {
          const textoNaEsquerda = i % 2 === 0;
          return (
            <article
              key={passo.numero}
              data-passo
              className="relative grid grid-cols-[20px_1fr] gap-[clamp(20px,4vw,32px)] py-[clamp(28px,5vh,56px)] lg:grid-cols-[1fr_96px_1fr] lg:gap-0 lg:items-center lg:py-[clamp(40px,7vh,88px)]"
            >
              <div
                className={`col-start-2 row-start-2 mt-[clamp(20px,3vh,28px)] grid justify-items-start text-left lg:row-start-1 lg:mt-0 ${
                  textoNaEsquerda
                    ? "lg:col-start-1 lg:justify-items-end lg:text-right"
                    : "lg:col-start-3 lg:justify-items-start lg:text-left"
                }`}
              >
                <span
                  data-rotulo
                  className="font-mono text-[11px] tracking-[.24em] uppercase text-[#5c6377] transition-colors duration-[600ms]"
                >
                  {passo.numero} — {passo.rotulo}
                </span>
                <h3 className="mt-[18px] text-[clamp(1.4rem,2.6vw,2.3rem)] font-bold leading-[1.08] tracking-[-.028em] max-w-[17ch] text-balance">
                  {passo.titulo}
                </h3>
                {passo.paragrafos.map((texto) => (
                  <p key={texto} className="mt-[18px] text-[16px] text-tinta2 leading-[1.7] max-w-[40ch]">
                    {texto}
                  </p>
                ))}
              </div>

              <div className="col-start-1 row-start-1 grid place-items-center self-start mt-[clamp(20px,3vw,34px)] lg:col-start-2 lg:mt-[clamp(44px,7vh,92px)]">
                <span
                  data-no
                  aria-hidden
                  className="w-[13px] h-[13px] bg-papel border border-[#4a5266] transition-[border-color,background-color,transform] duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)]"
                  style={{ transform: "rotate(45deg)" }}
                />
              </div>

              <figure
                data-figura
                className={`col-start-2 row-start-1 m-0 p-[clamp(20px,2.6vw,36px)] border border-linha bg-[#0d0f16] aspect-[16/11] transition-[border-color,background-color] duration-[600ms] ${
                  textoNaEsquerda ? "lg:col-start-3" : "lg:col-start-1"
                }`}
              >
                <CenaProcesso indice={i} />
              </figure>
            </article>
          );
        })}

        <div className="relative grid grid-cols-[20px_1fr] gap-[clamp(20px,4vw,32px)] pt-[clamp(8px,2vh,24px)] lg:grid-cols-[1fr_96px_1fr] lg:gap-0 lg:items-center">
          <div className="col-start-1 grid place-items-center lg:col-start-2">
            <span
              ref={fimRef}
              aria-hidden
              className="w-[19px] h-[19px] bg-papel border border-[#4a5266] transition-[border-color,background-color] duration-[600ms]"
              style={{ transform: "rotate(45deg)" }}
            />
          </div>
          <span className="col-start-2 font-mono text-[11px] tracking-[.24em] uppercase text-suave lg:col-start-3">
            No ar
          </span>
        </div>
      </div>

      <div className="mt-[clamp(40px,7vh,88px)] flex items-center gap-5 flex-wrap">
        <Link href="/solicitar" className="btn-p">
          Começar pelo briefing <span className="font-mono font-medium">→</span>
        </Link>
        <span ref={contadorRef} className="font-mono text-[12px] tracking-[.14em] text-suave tabular-nums">
          01 / {String(passos.length).padStart(2, "0")}
        </span>
      </div>
    </>
  );
}

/** As quatro cenas técnicas do trilho, desenhadas parte a parte. */
function CenaProcesso({ indice }: { indice: number }) {
  const comum = { width: "100%", height: "100%" } as const;

  if (indice === 0) {
    return (
      <svg viewBox="0 0 320 220" role="img" aria-hidden style={{ ...comum, display: "block", overflow: "visible" }}>
        <rect data-parte="1" x="34" y="46" width="186" height="122" fill="#101219" stroke="#363d50" strokeWidth="1" />
        <line data-parte="1" data-traco x1="34" y1="66" x2="220" y2="66" stroke="#363d50" strokeWidth="1" />
        <circle data-parte="1" cx="44" cy="56" r="2.5" fill="#4a5266" />
        <circle data-parte="1" cx="53" cy="56" r="2.5" fill="#4a5266" />
        <line data-parte="2" data-traco x1="50" y1="88" x2="150" y2="88" stroke="#5c6377" strokeWidth="2" />
        <line data-parte="2" data-traco x1="50" y1="102" x2="188" y2="102" stroke="#4a5266" strokeWidth="2" />
        <line data-parte="3" data-traco x1="50" y1="116" x2="120" y2="116" stroke="#4a5266" strokeWidth="2" />
        <rect data-parte="3" x="50" y="134" width="58" height="18" fill="none" stroke="#ff8a65" strokeWidth="1.5" />
        <path data-parte="4" d="M196 24 h74 v40 h-52 l-10 12 v-12 h-12 z" fill="#12141c" stroke="#8474f0" strokeWidth="1.5" />
        <line data-parte="5" data-traco x1="208" y1="40" x2="252" y2="40" stroke="#8474f0" strokeWidth="2" />
        <line data-parte="5" data-traco x1="208" y1="52" x2="236" y2="52" stroke="#4e3fc7" strokeWidth="2" />
        <rect data-parte="6" x="248" y="112" width="30" height="30" fill="none" stroke="#363d50" strokeWidth="1" />
        <rect data-parte="6" x="262" y="150" width="16" height="16" fill="#ff8a65" opacity=".55" />
        <circle data-parte="7" cx="26" cy="150" r="9" fill="none" stroke="#4a5266" strokeWidth="1" />
      </svg>
    );
  }

  if (indice === 1) {
    return (
      <svg viewBox="0 0 320 220" role="img" aria-hidden style={{ ...comum, display: "block", overflow: "visible" }}>
        <rect data-parte="1" x="112" y="26" width="96" height="40" fill="#101219" stroke="#8474f0" strokeWidth="1.5" />
        <line data-parte="1" data-traco x1="128" y1="40" x2="192" y2="40" stroke="#8474f0" strokeWidth="2" />
        <line data-parte="1" data-traco x1="128" y1="52" x2="170" y2="52" stroke="#4e3fc7" strokeWidth="2" />
        <path data-parte="2" data-traco d="M160 66 v22 H60 v18" fill="none" stroke="#363d50" strokeWidth="1" />
        <path data-parte="2" data-traco d="M160 66 v22 h100 v18" fill="none" stroke="#363d50" strokeWidth="1" />
        <path data-parte="2" data-traco d="M160 66 v40" fill="none" stroke="#363d50" strokeWidth="1" />
        <rect data-parte="3" x="26" y="106" width="68" height="34" fill="#101219" stroke="#4a5266" strokeWidth="1" />
        <line data-parte="3" data-traco x1="38" y1="123" x2="76" y2="123" stroke="#4a5266" strokeWidth="2" />
        <rect data-parte="4" x="126" y="106" width="68" height="34" fill="#101219" stroke="#ff8a65" strokeWidth="1.5" />
        <line data-parte="4" data-traco x1="138" y1="123" x2="176" y2="123" stroke="#ff8a65" strokeWidth="2" />
        <rect data-parte="5" x="226" y="106" width="68" height="34" fill="#101219" stroke="#4a5266" strokeWidth="1" />
        <line data-parte="5" data-traco x1="238" y1="123" x2="272" y2="123" stroke="#4a5266" strokeWidth="2" />
        <path data-parte="6" data-traco d="M60 140 v20 h100 v-20" fill="none" stroke="#363d50" strokeWidth="1" />
        <path data-parte="6" data-traco d="M260 140 v20 H160" fill="none" stroke="#363d50" strokeWidth="1" />
        <rect data-parte="7" x="132" y="168" width="56" height="26" fill="none" stroke="#4a5266" strokeWidth="1" />
      </svg>
    );
  }

  if (indice === 2) {
    return (
      <svg viewBox="0 0 320 220" role="img" aria-hidden style={{ ...comum, display: "block", overflow: "visible" }}>
        <rect data-parte="1" x="30" y="34" width="200" height="146" fill="#101219" stroke="#363d50" strokeWidth="1" />
        <line data-parte="1" data-traco x1="30" y1="54" x2="230" y2="54" stroke="#363d50" strokeWidth="1" />
        <line data-parte="1" data-traco x1="76" y1="54" x2="76" y2="180" stroke="#363d50" strokeWidth="1" />
        <rect data-parte="2" x="42" y="66" width="22" height="4" fill="#4a5266" />
        <rect data-parte="2" x="42" y="78" width="22" height="4" fill="#363d50" />
        <rect data-parte="2" x="42" y="90" width="22" height="4" fill="#363d50" />
        <rect data-parte="3" x="90" y="68" width="60" height="38" fill="none" stroke="#4a5266" strokeWidth="1" />
        <rect data-parte="3" x="158" y="68" width="60" height="38" fill="none" stroke="#4a5266" strokeWidth="1" />
        <rect data-parte="4" x="90" y="118" width="128" height="46" fill="none" stroke="#ff8a65" strokeWidth="1.5" />
        <line data-parte="4" data-traco x1="102" y1="134" x2="170" y2="134" stroke="#ff8a65" strokeWidth="2" />
        <line data-parte="4" data-traco x1="102" y1="148" x2="140" y2="148" stroke="#56321f" strokeWidth="2" />
        <rect data-parte="5" x="216" y="112" width="72" height="72" fill="#0b0d13" stroke="#4a5266" strokeWidth="1" />
        <text data-parte="6" x="228" y="140" fontFamily="IBM Plex Mono, monospace" fontSize="13" fill="#8474f0">&gt;_</text>
        <line data-parte="6" data-traco x1="228" y1="154" x2="272" y2="154" stroke="#363d50" strokeWidth="2" />
        <line data-parte="6" data-traco x1="228" y1="166" x2="256" y2="166" stroke="#363d50" strokeWidth="2" />
        <rect data-parte="7" x="250" y="30" width="20" height="20" fill="#8474f0" opacity=".5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 320 220" role="img" aria-hidden style={{ ...comum, display: "block", overflow: "visible" }}>
      <rect data-parte="1" x="46" y="52" width="176" height="118" fill="#101219" stroke="#4a5266" strokeWidth="1" />
      <line data-parte="1" data-traco x1="46" y1="72" x2="222" y2="72" stroke="#363d50" strokeWidth="1" />
      <line data-parte="2" data-traco x1="64" y1="94" x2="150" y2="94" stroke="#5c6377" strokeWidth="2" />
      <line data-parte="2" data-traco x1="64" y1="108" x2="196" y2="108" stroke="#363d50" strokeWidth="2" />
      <rect data-parte="3" x="64" y="126" width="62" height="20" fill="#ff8a65" opacity=".85" />
      <rect data-parte="3" x="134" y="126" width="46" height="20" fill="none" stroke="#4a5266" strokeWidth="1" />
      <circle data-parte="4" cx="248" cy="60" r="20" fill="none" stroke="#5fd68c" strokeWidth="1.5" />
      <path data-parte="5" data-traco d="M239 60 l6 7 l12 -15" fill="none" stroke="#5fd68c" strokeWidth="2" strokeLinecap="square" />
      <path data-parte="6" data-traco d="M262 148 v-38" fill="none" stroke="#8474f0" strokeWidth="1.5" />
      <path data-parte="6" data-traco d="M254 118 l8 -9 l8 9" fill="none" stroke="#8474f0" strokeWidth="1.5" />
      <line data-parte="7" data-traco x1="240" y1="160" x2="284" y2="160" stroke="#363d50" strokeWidth="1" />
      <rect data-parte="7" x="22" y="88" width="14" height="14" fill="none" stroke="#363d50" strokeWidth="1" />
    </svg>
  );
}
