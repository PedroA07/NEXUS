"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

type Posicao = "centro" | "esquerda" | "direita";

type Bloco = {
  olho: string;
  titulo: string;
  corpo: string;
  imagem: string;
  video?: string;
  cta?: boolean;
  posicao: Posicao;
};

const BLOCOS: Bloco[] = [
  {
    olho: "Desenvolvimento de software",
    titulo: "Software feito para o seu problema, não para o catálogo de alguém.",
    corpo: "Sites, sistemas, aplicativos e automações sob medida. Começa com um briefing em linguagem que qualquer pessoa entende e termina com você acompanhando cada etapa por uma área própria.",
    imagem: "/hero/00-cristal.png",
    video: "/hero/00-cristal.mp4",
    cta: true,
    posicao: "centro",
  },
  {
    olho: "Sites e páginas de venda",
    titulo: "Da vitrine institucional à página feita para converter.",
    corpo: "Com texto, layout e medição de resultado, pensados para o seu público.",
    imagem: "/hero/01-site.png",
    video: "/hero/01-site.mp4",
    posicao: "esquerda",
  },
  {
    olho: "Sistemas sob medida",
    titulo: "Cadastros, pedidos, agendamento, relatórios.",
    corpo: "O que hoje vive numa planilha vira um sistema com login e histórico.",
    imagem: "/hero/02-sistema.png",
    video: "/hero/02-sistema.mp4",
    posicao: "direita",
  },
  {
    olho: "Aplicativos",
    titulo: "Android e iPhone a partir de uma base só.",
    corpo: "Publicados nas lojas e prontos para atualizar sempre que precisar.",
    imagem: "/hero/03-app.png",
    posicao: "centro",
  },
  {
    olho: "Automações e bots",
    titulo: "Aquela tarefa repetitiva que consome sua semana.",
    corpo: "Passa a acontecer sozinha, sem depender de ninguém lembrar.",
    imagem: "/hero/04-automacao.png",
    video: "/hero/04-automacao.mp4",
    posicao: "esquerda",
  },
  {
    olho: "Dados e relatórios",
    titulo: "Os números do negócio em um painel só.",
    corpo: "Atualizados sem ninguém precisar montar planilha.",
    imagem: "/hero/05-dados.png",
    posicao: "direita",
  },
  {
    olho: "Inteligência artificial",
    titulo: "Atendimento automático, classificação e análise.",
    corpo: "Integrados ao que você já usa, sem trocar de sistema.",
    imagem: "/hero/06-ia.png",
    posicao: "centro",
  },
];

// Janela [0..1] de cada bloco dentro do progresso total do scroll.
function useJanela(indice: number, total: number) {
  const largura = 1 / total;
  const inicio = indice * largura;
  const fim = inicio + largura;
  return { inicio, fim, largura };
}

// Fração da largura de um bloco usada como zona de transição, dividida
// igualmente pra cada lado da fronteira entre dois blocos.
const TRANSICAO_FRACAO = 0.4;

// Opacidade do bloco. A zona de fade-out de um bloco e a de fade-in do
// próximo são o MESMO intervalo (centrado na fronteira entre os dois),
// não intervalos vizinhos que só se tocam num ponto — senão os dois ficam
// com opacidade 0 ao mesmo tempo bem no meio da troca, e some tudo por um
// instante (lê como a tela escurecendo e trocando, não como um dissolve).
function useBlocoOpacidade(indice: number, total: number, progresso: MotionValue<number>) {
  const { inicio, fim, largura } = useJanela(indice, total);
  const meio = (largura * TRANSICAO_FRACAO) / 2;
  const primeiro = indice === 0;
  const ultimo = indice === total - 1;

  const entradas = primeiro
    ? [fim - meio, fim + meio]
    : ultimo
      ? [inicio - meio, inicio + meio]
      : [inicio - meio, inicio + meio, fim - meio, fim + meio];
  const saidas = primeiro ? [1, 0] : ultimo ? [0, 1] : [0, 1, 1, 0];

  return useTransform(progresso, entradas, saidas);
}

// Janela em que o vídeo do bloco realmente avança: só durante o platô em
// que ele já está 100% opaco, não durante o dissolve. O clipe termina de
// tocar ANTES do crossfade começar e só recomeça DEPOIS dele terminar,
// senão duas animações diferentes se misturam durante a transição.
function useJanelaVideo(indice: number, total: number) {
  const { inicio, fim, largura } = useJanela(indice, total);
  const meio = (largura * TRANSICAO_FRACAO) / 2;
  const primeiro = indice === 0;
  const ultimo = indice === total - 1;
  const videoInicio = primeiro ? inicio : inicio + meio;
  const videoFim = ultimo ? fim : fim - meio;
  return { videoInicio, videoFim };
}

// Motion (13.x) não está aplicando `style={{ opacity: motionValue }}` ao DOM
// de forma confiável nesse setup (React 19 + Next 15). O valor derivado fica
// certo (`.get()` correto), mas o navegador nunca recebe o paint. Contorna
// escrevendo a opacidade direto no elemento via ref, o mesmo padrão já usado
// para raspar o currentTime do vídeo.
function useOpacidadeImperativa(indice: number, total: number, progresso: MotionValue<number>) {
  const ref = useRef<HTMLDivElement>(null);
  const opacidade = useBlocoOpacidade(indice, total, progresso);

  useMotionValueEvent(opacidade, "change", (v) => {
    if (ref.current) ref.current.style.opacity = String(v);
  });

  return { ref, valorInicial: opacidade.get() };
}

export function HeroScrollytelling() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [montado, setMontado] = useState(false);
  const reduzMovimento = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    setMontado(true);
  }, []);

  if (reduzMovimento) {
    return (
      <section id="servicos" className="relative overflow-hidden border-b border-linha bg-papel">
        <Image
          src={BLOCOS[0].imagem}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
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
        {montado &&
          BLOCOS.map((bloco, indice) => (
            <CamadaFundo
              key={bloco.imagem}
              bloco={bloco}
              indice={indice}
              total={BLOCOS.length}
              progresso={scrollYProgress}
            />
          ))}

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

// Com o texto do lado esquerdo, o assunto do vídeo/imagem desloca para a
// direita (e vice-versa), pra não ficar escondido atrás do texto.
const FOCO_FUNDO: Record<Posicao, string> = {
  centro: "50% center",
  esquerda: "80% center",
  direita: "20% center",
};

// Gradiente sempre presente, só que posicionado atrás de onde o texto
// está em cada bloco — em vez de escurecer a tela inteira (o que lê como
// um flash ao trocar de bloco), escurece só a área por trás da leitura.
const GRADIENTE_TEXTO: Record<Posicao, string> = {
  centro: "radial-gradient(ellipse 62% 48% at 50% 58%, rgba(11,13,19,0.72), transparent 72%)",
  esquerda: "linear-gradient(100deg, rgba(11,13,19,0.72) 0%, rgba(11,13,19,0.45) 32%, transparent 62%)",
  direita: "linear-gradient(260deg, rgba(11,13,19,0.72) 0%, rgba(11,13,19,0.45) 32%, transparent 62%)",
};

function CamadaFundo({
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
  const { ref, valorInicial } = useOpacidadeImperativa(indice, total, progresso);
  const { videoInicio, videoFim } = useJanelaVideo(indice, total);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duracao, setDuracao] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // "Destrava" o decodificador de vídeo no iOS Safari, senão o primeiro
    // ajuste de currentTime pelo scroll não funciona.
    video.play().then(() => video.pause()).catch(() => {});
  }, []);

  useMotionValueEvent(progresso, "change", (v) => {
    const video = videoRef.current;
    if (!video || !duracao) return;
    const local = Math.min(1, Math.max(0, (v - videoInicio) / (videoFim - videoInicio)));
    video.currentTime = local * duracao;
  });

  const objectPosition = FOCO_FUNDO[bloco.posicao];

  return (
    <div ref={ref} style={{ opacity: valorInicial }} className="absolute inset-0">
      {bloco.video ? (
        <video
          ref={videoRef}
          src={bloco.video}
          poster={bloco.imagem}
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={(e) => {
            setDuracao(e.currentTarget.duration);
            // Decodifica um frame real de imediato, em vez de deixar só o
            // poster à mostra até o primeiro ajuste de scroll chegar.
            e.currentTarget.currentTime = 0;
          }}
          style={{ objectPosition }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <Image
          src={bloco.imagem}
          alt=""
          fill
          priority={indice === 0}
          sizes="100vw"
          style={{ objectPosition }}
          className="object-cover"
        />
      )}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: GRADIENTE_TEXTO[bloco.posicao] }}
      />
    </div>
  );
}

const ALINHO_TEXTO: Record<Posicao, string> = {
  centro: "justify-center text-center",
  esquerda: "justify-start text-left",
  direita: "justify-end text-left",
};

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
  const { ref, valorInicial } = useOpacidadeImperativa(indice, total, progresso);
  const centralizado = bloco.posicao === "centro";

  return (
    <div ref={ref} style={{ opacity: valorInicial }} className="absolute inset-0 flex items-center pointer-events-none">
      <div className={`max-w-6xl mx-auto px-5 w-full flex ${ALINHO_TEXTO[bloco.posicao]}`}>
        <div className="max-w-2xl pointer-events-auto">
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
            <div className={`mt-8 flex flex-wrap gap-3 ${centralizado ? "justify-center" : "justify-start"}`}>
              <Link href="/solicitar" className="btn-p">Solicitar orçamento</Link>
              <Link href="/projetos" className="btn-s">Ver projetos</Link>
            </div>
          )}
        </div>
      </div>
    </div>
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
