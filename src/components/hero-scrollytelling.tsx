"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

type Bloco = { olho: string; titulo: string; corpo: string; cta?: boolean };

const BLOCOS: Bloco[] = [
  {
    olho: "Desenvolvimento de software",
    titulo: "Software feito para o seu problema, não para o catálogo de alguém.",
    corpo: "Sites, sistemas, aplicativos e automações sob medida. Começa com um briefing em linguagem que qualquer pessoa entende e termina com você acompanhando cada etapa por uma área própria.",
    cta: true,
  },
  {
    olho: "Sites e páginas de venda",
    titulo: "Da vitrine institucional à página feita para converter.",
    corpo: "Com texto, layout e medição de resultado, pensados para o seu público.",
  },
  {
    olho: "Sistemas sob medida",
    titulo: "Cadastros, pedidos, agendamento, relatórios.",
    corpo: "O que hoje vive numa planilha vira um sistema com login e histórico.",
  },
  {
    olho: "Aplicativos",
    titulo: "Android e iPhone a partir de uma base só.",
    corpo: "Publicados nas lojas e prontos para atualizar sempre que precisar.",
  },
  {
    olho: "Automações e bots",
    titulo: "Aquela tarefa repetitiva que consome sua semana.",
    corpo: "Passa a acontecer sozinha, sem depender de ninguém lembrar.",
  },
  {
    olho: "Dados e relatórios",
    titulo: "Os números do negócio em um painel só.",
    corpo: "Atualizados sem ninguém precisar montar planilha.",
  },
  {
    olho: "Inteligência artificial",
    titulo: "Atendimento automático, classificação e análise.",
    corpo: "Integrados ao que você já usa, sem trocar de sistema.",
  },
];

export function HeroScrollytelling() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duracao, setDuracao] = useState(0);
  const [montado, setMontado] = useState(false);
  const reduzMovimento = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    setMontado(true);
    const video = videoRef.current;
    if (!video) return;
    // "Destrava" o decodificador de vídeo no iOS Safari, senão o primeiro
    // ajuste de currentTime pelo scroll não funciona.
    video.play().then(() => video.pause()).catch(() => {});
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const video = videoRef.current;
    if (!video || !duracao || reduzMovimento) return;
    video.currentTime = v * duracao;
  });

  if (reduzMovimento) {
    return (
      <section id="servicos" className="relative overflow-hidden border-b border-linha bg-papel">
        <video
          src="/hero.mp4"
          poster="/hero-poster.jpg"
          muted
          loop
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-papel/80 via-papel/70 to-papel" />
        <div className="relative max-w-6xl mx-auto px-5 pt-24 pb-16 grid gap-14">
          {BLOCOS.map((bloco) => (
            <BlocoEstatico key={bloco.titulo} bloco={bloco} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id="servicos"
      ref={containerRef}
      className="relative border-b border-linha bg-papel"
      style={{ height: `${BLOCOS.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <video
          ref={videoRef}
          src="/hero.mp4"
          poster="/hero-poster.jpg"
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={(e) => setDuracao(e.currentTarget.duration)}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-papel/75 via-papel/25 to-papel/85" />

        {montado &&
          BLOCOS.map((bloco, indice) => (
            <BlocoAnimado
              key={bloco.titulo}
              bloco={bloco}
              indice={indice}
              total={BLOCOS.length}
              progresso={scrollYProgress}
            />
          ))}
      </div>
    </section>
  );
}

function BlocoAnimado({
  bloco,
  indice,
  total,
  progresso,
}: {
  bloco: Bloco;
  indice: number;
  total: number;
  progresso: MotionValue<number>;
}) {
  const largura = 1 / total;
  const inicio = indice * largura;
  const fim = inicio + largura;
  const disperso = largura * 0.2;
  const primeiro = indice === 0;
  const ultimo = indice === total - 1;

  const entradas = primeiro ? [inicio, fim - disperso, fim] : ultimo ? [inicio, inicio + disperso, fim] : [inicio, inicio + disperso, fim - disperso, fim];
  const saidas = primeiro ? [1, 1, 0] : ultimo ? [0, 1, 1] : [0, 1, 1, 0];
  const opacidade = useTransform(progresso, entradas, saidas);

  return (
    <motion.div style={{ opacity: opacidade }} className="absolute inset-0 flex items-center pointer-events-none">
      <div className="max-w-6xl mx-auto px-5 w-full pointer-events-auto">
        <div className="max-w-2xl">
          <p className="olho">{bloco.olho}</p>
          <h2
            className={
              bloco.cta
                ? "mt-4 text-[clamp(2.1rem,5.4vw,3.6rem)] font-bold leading-[1.1] text-balance"
                : "mt-4 text-[clamp(1.7rem,4vw,2.6rem)] font-bold leading-[1.15] text-balance"
            }
          >
            {bloco.titulo}
          </h2>
          <p className="mt-5 text-lg text-tinta2 leading-relaxed max-w-xl">{bloco.corpo}</p>
          {bloco.cta && (
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/solicitar" className="btn-p">Solicitar orçamento</Link>
              <Link href="/projetos" className="btn-s">Ver projetos</Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function BlocoEstatico({ bloco }: { bloco: Bloco }) {
  return (
    <div className="relative max-w-2xl">
      <p className="olho">{bloco.olho}</p>
      <h2 className="mt-4 text-[clamp(1.9rem,4.6vw,3rem)] font-bold leading-[1.12] text-balance">{bloco.titulo}</h2>
      <p className="mt-5 text-lg text-tinta2 leading-relaxed">{bloco.corpo}</p>
      {bloco.cta && (
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/solicitar" className="btn-p">Solicitar orçamento</Link>
          <Link href="/projetos" className="btn-s">Ver projetos</Link>
        </div>
      )}
    </div>
  );
}
